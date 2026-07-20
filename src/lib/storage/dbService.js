import { Directory } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'
import { AppDataSource, sqlite } from './dataSource'

async function saveToStore() {
  if (Capacitor.getPlatform() === 'web') {
    await sqlite.saveToStore('transcriber')
  }
}

// Mapping from MediaPlayer._metadata camelCase keys → DB column names
const META_TO_COL = {
  bpm: 'beats_per_minute',
  beatsPerMeasure: 'beats_per_measure',
  title: 'title',
  mimeType: 'mime_type',
  lastPlaybackRate: 'last_playback_rate',
  lastLoopStartPosition: 'last_loop_start_position',
  lastLoopEndPosition: 'last_loop_end_position',
  lastPlaybackPosition: 'last_playback_position',
  last_accessed: 'last_accessed',
  name: 'name',
  type: 'type',
  link: 'link',
  fileName: 'file_name',
  fileSize: 'file_size',
  lastModified: 'last_modified',
  displayName: 'display_name',
  showVideo: 'show_video',
  loopEnabled: 'loop_enabled',
  globalStart: 'global_start',
}

function rowToMetadata(row) {
  if (!row) return null
  return {
    type: row.type,
    link: row.link ?? null,
    mimeType: row.mime_type ?? null,
    filePath: row.content ?? null,
    fileDirectory:
      row.file_directory === 'DOCUMENTS' ? Directory.Documents : Directory.Data,
    bpm: row.beats_per_minute ?? null,
    beatsPerMeasure: row.beats_per_measure ?? null,
    loops: {},
    name: row.display_name ?? row.name ?? null,
    lastPlaybackRate: row.last_playback_rate ?? null,
    lastLoopStartPosition: row.last_loop_start_position ?? null,
    lastLoopEndPosition: row.last_loop_end_position ?? null,
    lastPlaybackPosition: row.last_playback_position ?? null,
    showVideo: row.show_video !== 0,
    loopEnabled: row.loop_enabled !== 0,
    globalStart: row.global_start ?? null,
  }
}

// Convert flat loop DB rows (with parent_id) into the nested tree structure
// that Player.jsx and MediaPlayer use.
function flatToTree(rows) {
  const byId = {}
  for (const row of rows) byId[row.id] = row

  const childrenOf = {}
  for (const row of rows) {
    const pid = row.parent_id
    if (pid != null) {
      if (!childrenOf[pid]) childrenOf[pid] = []
      childrenOf[pid].push(row)
    }
  }

  const buildNode = row => {
    const children = childrenOf[row.id] || []
    const childrenObj = {}
    for (const child of children) {
      childrenObj[`${child.start_time}-${child.end_time}`] = buildNode(child)
    }
    return {
      id: row.id,
      loopStart: row.start_time,
      loopEnd: row.end_time,
      title: row.name ?? undefined,
      children: childrenObj,
    }
  }

  const root = {}
  for (const row of rows) {
    if (row.parent_id == null) {
      root[`${row.start_time}-${row.end_time}`] = buildNode(row)
    }
  }
  return root
}

export async function initDB() {
  if (!AppDataSource.isInitialized) {
    if (!document.querySelector('jeep-sqlite')) {
      const el = document.createElement('jeep-sqlite')
      document.body.appendChild(el)
      await customElements.whenDefined('jeep-sqlite')
    }

    try {
      await sqlite.initWebStore()
    } catch (e) {
      console.warn(e)
    }

    await AppDataSource.initialize()
  }
}

export async function getSongs() {
  const mgr = AppDataSource.manager
  const songs = await mgr.query(`
    SELECT id, name, display_name, type, last_accessed, mime_type, file_name,
           content, file_directory
    FROM song ORDER BY COALESCE(last_accessed, '') DESC
  `)
  for (const song of songs) {
    song.folders = await mgr.query(
      `SELECT f.id, f.name FROM folder f
       JOIN song_folder sf ON sf.folder_id = f.id
       WHERE sf.song_id = ? ORDER BY f.name`,
      [song.id],
    )
  }
  return songs
}

export async function getFolders() {
  return AppDataSource.manager.query(
    'SELECT id, name FROM folder ORDER BY name COLLATE NOCASE',
  )
}

export async function createFolder(name) {
  const trimmed = name.trim()
  if (!trimmed) return null
  const mgr = AppDataSource.manager
  await mgr.query(
    'INSERT OR IGNORE INTO folder (name, created_on) VALUES (?, ?)',
    [trimmed, new Date().toISOString()],
  )
  await saveToStore()
  const rows = await mgr.query('SELECT id, name FROM folder WHERE name = ?', [
    trimmed,
  ])
  return rows[0]
}

export async function setSongFolders(songId, folderIds) {
  const mgr = AppDataSource.manager
  await mgr.transaction(async tx => {
    await tx.query('DELETE FROM song_folder WHERE song_id = ?', [songId])
    for (const folderId of folderIds) {
      await tx.query(
        'INSERT OR IGNORE INTO song_folder (song_id, folder_id) VALUES (?, ?)',
        [songId, folderId],
      )
    }
  })
  await saveToStore()
}

export async function deleteSong(id) {
  const mgr = AppDataSource.manager
  const rows = await mgr.query(
    'SELECT content, file_directory, type FROM song WHERE id = ?',
    [id],
  )
  await mgr.query('DELETE FROM song WHERE id = ?', [id])
  await saveToStore()
  return rows[0] ?? null
}

export async function getSong(id) {
  const mgr = AppDataSource.manager
  const rows = await mgr.query('SELECT * FROM song WHERE id = ?', [id])
  if (!rows.length) return null

  const metadata = rowToMetadata(rows[0])
  const loopRows = await mgr.query(
    'SELECT * FROM loop WHERE song_id = ? ORDER BY id',
    [id],
  )
  metadata.loops = flatToTree(loopRows)
  return metadata
}

export async function upsertSong({
  sourceKey,
  name,
  type,
  link,
  content,
  fileDirectory,
  mimeType,
  fileName,
  fileSize,
  lastModified,
  lastAccessed,
}) {
  const mgr = AppDataSource.manager
  await mgr.query(
    `INSERT OR IGNORE INTO song
       (source_key, name, type, link, content, file_directory, mime_type, file_name, file_size, last_modified, last_accessed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sourceKey,
      name ?? sourceKey,
      type,
      link ?? null,
      content ?? null,
      fileDirectory ?? 'DATA',
      mimeType ?? null,
      fileName ?? null,
      fileSize ?? null,
      lastModified ?? null,
      lastAccessed ?? new Date().toISOString(),
    ],
  )
  const rows = await mgr.query('SELECT id FROM song WHERE source_key = ?', [
    sourceKey,
  ])
  await saveToStore()
  return { id: rows[0].id }
}

export async function patchSong(id, patch) {
  const mgr = AppDataSource.manager
  const setClauses = []
  const values = []

  for (const [key, value] of Object.entries(patch)) {
    if (key === 'loops' || key === 'sourceUrl' || key === 'fileDirectory')
      continue
    const col = META_TO_COL[key]
    if (!col) continue
    setClauses.push(`${col} = ?`)
    values.push(value ?? null)
  }

  if (!setClauses.length) return
  values.push(id)
  await mgr.query(
    `UPDATE song SET ${setClauses.join(', ')} WHERE id = ?`,
    values,
  )
  await saveToStore()
}

export async function syncLoops(songId, loopsTree) {
  const mgr = AppDataSource.manager
  const seenIds = new Set()

  async function syncLevel(mgr, loops, parentId) {
    for (const loop of Object.values(loops || {})) {
      if (loop.id != null) {
        await mgr.query(
          'UPDATE loop SET name = ?, parent_id = ? WHERE id = ?',
          [loop.title ?? null, parentId ?? null, loop.id],
        )
        seenIds.add(loop.id)
        await syncLevel(mgr, loop.children || {}, loop.id)
      } else {
        await mgr.query(
          'INSERT INTO loop (song_id, parent_id, name, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
          [
            songId,
            parentId ?? null,
            loop.title ?? null,
            loop.loopStart,
            loop.loopEnd,
          ],
        )
        const [{ id }] = await mgr.query('SELECT last_insert_rowid() as id')
        seenIds.add(id)
        await syncLevel(mgr, loop.children || {}, id)
      }
    }
  }

  await mgr.transaction(async tx => {
    await syncLevel(tx, loopsTree || {}, null)
    const existingRows = await tx.query(
      'SELECT id FROM loop WHERE song_id = ?',
      [songId],
    )
    for (const row of existingRows) {
      if (!seenIds.has(row.id)) {
        await tx.query('DELETE FROM loop WHERE id = ?', [row.id])
      }
    }
  })

  await saveToStore()
}

export async function getRecordingsByLoop(loopId) {
  const mgr = AppDataSource.manager
  return mgr.query(
    'SELECT * FROM recording WHERE loop_id = ? ORDER BY created_on ASC',
    [loopId],
  )
}

export async function addRecording({ loopId, filePath, fileDirectory, name }) {
  const mgr = AppDataSource.manager
  const createdOn = new Date().toISOString()
  const dir = fileDirectory ?? 'DATA'
  await mgr.query(
    'INSERT INTO recording (loop_id, file_path, file_directory, name, created_on) VALUES (?, ?, ?, ?, ?)',
    [loopId, filePath, dir, name ?? null, createdOn],
  )
  const [{ id }] = await mgr.query('SELECT last_insert_rowid() as id')
  await saveToStore()
  return {
    id,
    loopId,
    filePath,
    fileDirectory: dir,
    name: name ?? null,
    createdOn,
  }
}

export async function deleteRecording(id) {
  const mgr = AppDataSource.manager
  const rows = await mgr.query(
    'SELECT file_path, file_directory FROM recording WHERE id = ?',
    [id],
  )
  await mgr.query('DELETE FROM recording WHERE id = ?', [id])
  await saveToStore()
  const row = rows[0]
  return row
    ? { filePath: row.file_path, fileDirectory: row.file_directory ?? 'DATA' }
    : null
}

export async function getAppSetting(key, defaultValue = null) {
  const mgr = AppDataSource.manager
  const rows = await mgr.query('SELECT value FROM settings WHERE key = ?', [
    key,
  ])
  if (!rows.length) return defaultValue
  try {
    return JSON.parse(rows[0].value)
  } catch {
    return defaultValue
  }
}

export async function setAppSetting(key, value) {
  const mgr = AppDataSource.manager
  await mgr.query(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, JSON.stringify(value)],
  )
  await saveToStore()
}
