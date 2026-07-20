import { useEffect, useState } from 'react'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Moon, Sun } from 'lucide-react'

import { Player } from './Player/Player'
import { SONG_TYPE } from 'utils/constants'
import {
  createFolder,
  deleteSong,
  getFolders,
  getSongs,
  patchSong,
  setSongFolders,
  upsertSong,
} from '@lib/storage/dbService'
import { SongBrowser, songLabel } from './SongBrowser'
import { ConfirmActionDialog } from './ConfirmActionDialog'

import FileUpload from './FileUpload'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { Separator } from './ui'

function makeLocalFileId(file) {
  return `file:${file.name}:${file.size}:${file.lastModified}`
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        const base64 = result.split(',')[1] || ''
        resolve(base64)
      } else {
        reject(new Error('Unexpected FileReader result'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getSongIdFromPath() {
  const pathParts = window.location.pathname.split('/').filter(Boolean)
  if (pathParts.length !== 1) return null

  try {
    return decodeURIComponent(pathParts[0])
  } catch {
    return null
  }
}

export const Home = ({ showToast, themeMode, setThemeMode }) => {
  const [id, setId] = useState()
  const [songType, setSongType] = useState()
  const [showPlayer, setShowPlayer] = useState()
  const [inputText, setInputText] = useState()
  const [error, setError] = useState(false)
  const [songs, setSongs] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [renameSong, setRenameSong] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [folderSong, setFolderSong] = useState(null)
  const [selectedFolderIds, setSelectedFolderIds] = useState([])
  const [bulkActionTarget, setBulkActionTarget] = useState(null)

  const loadSongs = async () => {
    const [rows, folderRows] = await Promise.all([getSongs(), getFolders()])
    setSongs(rows)
    setFolders(folderRows)
    return rows
  }

  useEffect(() => {
    loadSongs()
      .then(rows => {
        const routeSongId = getSongIdFromPath()
        const routeSong = rows.find(song => String(song.id) === routeSongId)

        if (routeSong) {
          setId(routeSong.id)
          setSongType(routeSong.type)
          setShowPlayer(true)
        } else if (routeSongId) {
          window.history.replaceState({}, '', '/')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      const routeSongId = getSongIdFromPath()
      if (!routeSongId) {
        setShowPlayer(false)
        return
      }

      const routeSong = songs.find(song => String(song.id) === routeSongId)
      if (routeSong) {
        setId(routeSong.id)
        setSongType(routeSong.type)
        setShowPlayer(true)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [songs])

  // Reload songs when returning from Player so metadata updates are reflected.
  useEffect(() => {
    if (!showPlayer) {
      loadSongs()
    }
  }, [showPlayer])

  if (loading) return null

  const getYoutubeId = url => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = match && match[2].length === 11 ? match[2] : null
    videoId ? setError(null) : setError('invalid URL')
    return videoId
  }

  const handleChange = e => {
    setInputText(e.target.value)
    setError(null)
  }

  const openSong = async (songId, songType) => {
    await patchSong(songId, { last_accessed: new Date().toISOString() })
    const nextPath = `/${encodeURIComponent(songId)}`
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
    setId(songId)
    setSongType(songType)
    setShowPlayer(true)
  }

  const handleRename = async event => {
    event.preventDefault()
    if (!renameSong || !renameValue.trim()) return
    await patchSong(renameSong.id, { displayName: renameValue.trim() })
    setRenameSong(null)
    await loadSongs()
  }

  const handleFolderSave = async event => {
    event.preventDefault()
    if (!folderSong) return
    await setSongFolders(folderSong.id, selectedFolderIds)
    setFolderSong(null)
    await loadSongs()
  }

  const handleBulkDelete = songs => {
    setBulkActionTarget({ action: 'delete', songs })
  }

  const handleBulkMove = (songs, folder) => {
    setBulkActionTarget({ action: 'move', songs, folder })
  }

  const executeBulkAction = async () => {
    if (!bulkActionTarget) return
    const { action, songs, folder } = bulkActionTarget
    setBulkActionTarget(null)

    if (action === 'delete') {
      for (const song of songs) {
        const removed = await deleteSong(song.id)
        if (removed?.type === SONG_TYPE.FILE && removed.content) {
          try {
            await Filesystem.deleteFile({
              path: removed.content,
              directory:
                removed.file_directory === 'DOCUMENTS'
                  ? Directory.Documents
                  : Directory.Data,
            })
          } catch (error) {
            console.warn('Failed to delete local media file', error)
          }
        }
      }
    } else if (action === 'move') {
      for (const song of songs) {
        await setSongFolders(song.id, [folder.id])
      }
    }

    await loadSongs()
  }

  const closePlayer = () => {
    if (getSongIdFromPath()) {
      window.history.pushState({}, '', '/')
    }
    setShowPlayer(false)
  }

  const handleLocalFileSelect = async file => {
    if (!file) return

    const mimeType = file.type || ''

    if (!mimeType.startsWith('audio/') && !mimeType.startsWith('video/')) {
      showToast?.('Unsupported file type')
      return
    }

    const sourceKey = makeLocalFileId(file)
    const filePath = `media/${sourceKey.replace(/[^a-zA-Z0-9-_]/g, '_')}`

    try {
      const base64Data = await fileToBase64(file)

      await Filesystem.writeFile({
        path: filePath,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      })

      const { id } = await upsertSong({
        sourceKey,
        name: file.name,
        type: SONG_TYPE.FILE,
        content: filePath,
        fileDirectory: 'DOCUMENTS',
        mimeType,
        fileName: file.name,
        fileSize: file.size,
        lastModified: file.lastModified,
      })

      await openSong(id, SONG_TYPE.FILE)
    } catch (err) {
      console.error('Failed to save local file', err)
      showToast?.('Error saving local file')
    }
  }

  const handleSubmit = async () => {
    const ytId = getYoutubeId(inputText)
    if (!ytId) return

    const { id } = await upsertSong({
      sourceKey: ytId,
      name: ytId,
      type: SONG_TYPE.YOUTUBE,
      link: ytId,
    })
    await openSong(id, SONG_TYPE.YOUTUBE)
  }

  return !showPlayer ? (
    <TooltipProvider>
      <div className='mx-auto flex h-full w-full max-w-5xl flex-col gap-6 p-4 pb-6 sm:p-6'>
        <div className='flex items-center justify-between gap-2'>
          <h1 className='text-3xl font-bold'>Transcriber!</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                onClick={() =>
                  setThemeMode(themeMode === 'dark' ? 'light' : 'dark')
                }
                aria-label='Toggle theme'
              >
                {themeMode === 'dark' ? <Sun /> : <Moon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle light/dark</TooltipContent>
          </Tooltip>
        </div>

        <CardTitle className='mt-4'>Load a source</CardTitle>

        <div className='flex flex-col gap-3 sm:flex-row'>
          <Card className='flex-1'>
            <CardHeader>
              <CardTitle>YouTube Video URL</CardTitle>
            </CardHeader>

            <CardContent>
              <div className='flex flex-col gap-2 sm:flex-row'>
                <div className='flex-1'>
                  <Input
                    value={inputText || ''}
                    onChange={handleChange}
                    placeholder='https://youtube.com/watch?v=...'
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSubmit()
                    }}
                  />
                  {error && (
                    <div className='mt-1 text-xs text-destructive'>{error}</div>
                  )}
                </div>
                <Button
                  className='sm:w-28'
                  disabled={!inputText}
                  onClick={handleSubmit}
                >
                  go
                </Button>
              </div>
            </CardContent>
          </Card>
          <Separator className='hidden sm:block' orientation='vertical' />
          <Card className='flex-1'>
            <CardHeader>
              <CardTitle>Local file</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept='audio/*,video/*'
                onFileSelect={handleLocalFileSelect}
              />
            </CardContent>
          </Card>
        </div>

        <SongBrowser
          songs={songs}
          folders={folders}
          onOpen={openSong}
          onRename={song => {
            setRenameSong(song)
            setRenameValue(songLabel(song))
          }}
          onDelete={song => handleBulkDelete([song])}
          onFolders={song => {
            setFolderSong(song)
            setSelectedFolderIds(song.folders?.map(folder => folder.id) || [])
          }}
          onCreateFolder={async name => {
            await createFolder(name)
            await loadSongs()
          }}
          onBulkDelete={handleBulkDelete}
          onBulkMove={handleBulkMove}
        />

        <Dialog
          open={Boolean(renameSong)}
          onOpenChange={open => !open && setRenameSong(null)}
        >
          <DialogContent className='max-w-sm'>
            <DialogHeader>
              <DialogTitle>Rename song</DialogTitle>
            </DialogHeader>
            <form className='flex gap-2 pt-2' onSubmit={handleRename}>
              <Input
                autoFocus
                value={renameValue}
                onChange={event => setRenameValue(event.target.value)}
              />
              <Button type='submit' disabled={!renameValue.trim()}>
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(folderSong)}
          onOpenChange={open => !open && setFolderSong(null)}
        >
          <DialogContent className='max-w-sm'>
            <DialogHeader>
              <DialogTitle>Organize song</DialogTitle>
            </DialogHeader>
            <form className='space-y-3 pt-2' onSubmit={handleFolderSave}>
              {!folders.length && (
                <p className='text-sm text-muted-foreground'>
                  Create a folder first.
                </p>
              )}
              {folders.map(folder => (
                <label
                  key={folder.id}
                  className='flex items-center gap-2 text-sm'
                >
                  <input
                    type='checkbox'
                    checked={selectedFolderIds.includes(folder.id)}
                    onChange={event =>
                      setSelectedFolderIds(current =>
                        event.target.checked
                          ? [...current, folder.id]
                          : current.filter(id => id !== folder.id),
                      )
                    }
                  />
                  {folder.name}
                </label>
              ))}
              <div className='flex justify-end'>
                <Button type='submit'>Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmActionDialog
          open={Boolean(bulkActionTarget)}
          onOpenChange={open => !open && setBulkActionTarget(null)}
          action={bulkActionTarget?.action}
          songs={bulkActionTarget?.songs ?? []}
          targetFolder={bulkActionTarget?.folder}
          onConfirm={executeBulkAction}
        />
      </div>
    </TooltipProvider>
  ) : (
    <Player
      id={id}
      type={songType}
      setShowPlayer={closePlayer}
      showToast={showToast}
    />
  )
}
