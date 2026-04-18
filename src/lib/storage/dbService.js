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
}

function rowToMetadata(row) {
  if (!row) return null
  return {
    type: row.type,
    mimeType: row.mime_type ?? null,
    filePath: row.content ?? null,
    fileDirectory: Directory.Data,
    bpm: row.beats_per_minute ?? null,
    beatsPerMeasure: row.beats_per_measure ?? null,
    loops: {},
    title: row.title ?? null,
    lastPlaybackRate: row.last_playback_rate ?? null,
    lastLoopStartPosition: row.last_loop_start_position ?? null,
    lastLoopEndPosition: row.last_loop_end_position ?? null,
    lastPlaybackPosition: row.last_playback_position ?? null,
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

// Recursively insert the loop tree, preserving parent_id relationships.
async function insertLoopTree(mgr, songId, loops, parentId) {
  for (const loop of Object.values(loops || {})) {
    await mgr.query(
      'INSERT INTO loop (song_id, parent_id, name, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [songId, parentId ?? null, loop.title ?? null, loop.loopStart, loop.loopEnd],
    )
    const [{ id }] = await mgr.query('SELECT last_insert_rowid() as id')
    await insertLoopTree(mgr, songId, loop.children || {}, id)
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function initDB() {
  if (!AppDataSource.isInitialized) {
    if (!document.querySelector('jeep-sqlite')) {
      const el = document.createElement('jeep-sqlite')
      document.body.appendChild(el)
      await customElements.whenDefined('jeep-sqlite')
    }
    await sqlite.initWebStore()
    await AppDataSource.initialize()
  }
}

export async function getSongs() {
  const mgr = AppDataSource.manager
  return mgr.query(
    'SELECT id, name, type, title, last_accessed, mime_type FROM song ORDER BY last_accessed DESC NULLS LAST',
  )
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

export async function upsertSong({ sourceKey, name, type, link, content, mimeType, fileName, fileSize, lastModified, lastAccessed }) {
  const mgr = AppDataSource.manager
  await mgr.query(
    `INSERT OR IGNORE INTO song
       (source_key, name, type, link, content, mime_type, file_name, file_size, last_modified, last_accessed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sourceKey,
      name ?? sourceKey,
      type,
      link ?? null,
      content ?? null,
      mimeType ?? null,
      fileName ?? null,
      fileSize ?? null,
      lastModified ?? null,
      lastAccessed ?? new Date().toISOString(),
    ],
  )
  const rows = await mgr.query('SELECT id FROM song WHERE source_key = ?', [sourceKey])
  await saveToStore()
  return { id: rows[0].id }
}

export async function patchSong(id, patch) {
  const mgr = AppDataSource.manager
  const setClauses = []
  const values = []

  for (const [key, value] of Object.entries(patch)) {
    if (key === 'loops' || key === 'sourceUrl' || key === 'fileDirectory') continue
    const col = META_TO_COL[key]
    if (!col) continue
    setClauses.push(`${col} = ?`)
    values.push(value ?? null)
  }

  if (!setClauses.length) return
  values.push(id)
  await mgr.query(`UPDATE song SET ${setClauses.join(', ')} WHERE id = ?`, values)
  await saveToStore()
}

export async function syncLoops(songId, loopsTree) {
  const mgr = AppDataSource.manager
  await mgr.transaction(async tx => {
    await tx.query('DELETE FROM loop WHERE song_id = ?', [songId])
    await insertLoopTree(tx, songId, loopsTree || {}, null)
  })
  await saveToStore()
}

export async function getAppSetting(key, defaultValue = null) {
  const mgr = AppDataSource.manager
  const rows = await mgr.query('SELECT value FROM settings WHERE key = ?', [key])
  if (!rows.length) return defaultValue
  try {
    return JSON.parse(rows[0].value)
  } catch {
    return defaultValue
  }
}

export async function setAppSetting(key, value) {
  const mgr = AppDataSource.manager
  await mgr.query('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    key,
    JSON.stringify(value),
  ])
  await saveToStore()
}
