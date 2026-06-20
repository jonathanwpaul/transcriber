import { useEffect, useState } from 'react'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Moon, Sun } from 'lucide-react'

import { Player } from './Player/Player'
import { SONG_TYPE } from 'utils/constants'
import { getSongs, upsertSong, patchSong } from '@lib/storage/dbService'

import FileUpload from './FileUpload'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
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

export const Home = ({ showToast, themeMode, setThemeMode }) => {
  const [id, setId] = useState()
  const [songType, setSongType] = useState()
  const [showPlayer, setShowPlayer] = useState()
  const [inputText, setInputText] = useState()
  const [error, setError] = useState(false)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)

  const loadSongs = async () => {
    const rows = await getSongs()
    setSongs(rows)
  }

  useEffect(() => {
    loadSongs().finally(() => setLoading(false))
  }, [])

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
    setId(songId)
    setSongType(songType)
    setShowPlayer(true)
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

  const formatTimeString = timeString => new Date(timeString).toLocaleString()

  return !showPlayer ? (
    <TooltipProvider>
      <div className='mx-auto flex h-full w-full max-w-5xl flex-col gap-6 p-4 sm:p-6'>
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

        <CardTitle className='mt-4'>Recents</CardTitle>

        {songs.length > 0 && (
          <Card>
            <CardContent className='flex flex-col gap-1'>
              {songs.map(song => (
                <button
                  key={song.id}
                  onClick={() => openSong(song.id, song.type)}
                  className='flex flex-col md:flex-row w-full items-start md:items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent'
                >
                  <div className='min-w-0 flex-1 w-full font-medium text-primary'>
                    {song.title ?? song.name ?? song.id}
                  </div>
                  <div className='shrink-0 text-xs text-muted-foreground'>
                    {song.last_accessed
                      ? formatTimeString(song.last_accessed)
                      : ''}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  ) : (
    <Player
      id={id}
      type={songType}
      setShowPlayer={setShowPlayer}
      showToast={showToast}
    />
  )
}
