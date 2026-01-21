import { useEffect, useRef, useState } from 'react'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Code2, Moon, Sun } from 'lucide-react'

import { Player } from './Player/Player'
import { usePreferenceValue } from 'hooks/usePreferenceValue'
import { videoSources } from 'utils/constants'

import FileUpload from './FileUpload'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

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
  const [showPlayer, setShowPlayer] = useState()
  const [inputText, setInputText] = useState()
  const [error, setError] = useState(false)
  const {
    preference: videosString,
    loading,
    setValue: setVideos,
    reload: reloadVideos,
  } = usePreferenceValue({
    key: 'videos',
  })
  const videos = JSON.parse(videosString) || {}
  const [showJSON, setShowJSON] = useState(false)
  const [JSONText, setJSONText] = useState(videosString)
  const JSONInputRef = useRef()

  useEffect(() => {
    try {
      const parsed = JSON.parse(videosString || '{}')
      setJSONText(JSON.stringify(parsed || {}, null, 2))
    } catch {
      setJSONText(videosString || '{}')
    }
  }, [videosString])

  // When we return from the Player view back to the Home view, reload the
  // latest videos from storage so that metadata written by MediaPlayer
  // subclasses (e.g. YouTube titles) is reflected in the Recents list.
  useEffect(() => {
    if (!showPlayer && reloadVideos) {
      reloadVideos()
    }
  }, [showPlayer, reloadVideos])

  if (loading) return

  const getId = url => {
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

  const showVideoId = id => {
    videos[id].last_accessed = new Date()
    setVideos('videos', videos).then(() => {
      setId(id)
      setShowPlayer(true)
    })
  }

  const handleLocalFileSelect = async file => {
    if (!file) return

    const id = makeLocalFileId(file)
    const mimeType = file.type || ''

    // Only allow audio/video MIME types.
    if (!mimeType.startsWith('audio/') && !mimeType.startsWith('video/')) {
      showToast?.('Unsupported file type')
      return
    }

    // Persist the file with Capacitor Filesystem using a deterministic path
    // derived from the local file id. This avoids relying on blob: URLs, which
    // are not stable across reloads.
    const safeId = id.replace(/[^a-zA-Z0-9-_]/g, '_')
    const filePath = `media/${safeId}`

    try {
      const base64Data = await fileToBase64(file)

      await Filesystem.writeFile({
        path: filePath,
        data: base64Data,
        directory: Directory.Data,
      })

      const existing = videos[id]

      videos[id] = {
        ...(existing || {}),
        type: videoSources.FILE,
        title: file.name,
        fileName: file.name,
        fileSize: file.size,
        lastModified: file.lastModified,
        mimeType,
        filePath,
        fileDirectory: Directory.Data,
        // Do not persist blob: URLs – they are not stable across reloads.
        sourceUrl: null,
      }

      showVideoId(id)
    } catch (err) {
      console.error('Failed to save file to Capacitor Filesystem', err)
      showToast?.('Error saving local file')
    }
  }

  const handleSubmit = () => {
    const id = getId(inputText)
    if (!id) return
    if (!videos[id]) videos[id] = { type: videoSources.YOUTUBE }
    showVideoId(id)
  }

  const formatTimeString = timeString => new Date(timeString).toLocaleString()

  const videoList = Object.keys(videos)
    .filter(key => {
      const entry = videos[key]
      if (!entry) return false

      if (entry.type === videoSources.FILE) {
        // Hide legacy local-file entries that only have blob: URLs persisted.
        if (!entry.filePath) {
          const src = entry.sourceUrl
          if (!src || typeof src !== 'string') return false
          if (src.startsWith('blob:')) return false
        }
      }

      return true
    })
    .sort((a, b) =>
      videos[a]['last_accessed'] > videos[b]['last_accessed'] ? -1 : 1,
    )

  // if there's a cached entry and not one already selected, use that
  // if (videoList.length > 0 && !showPlayer && !id) {
  //   setId(videoList[0])
  //   setShowPlayer(true)
  // }

  return !showPlayer ? (
    <TooltipProvider>
      <div className='mx-auto flex h-full w-full max-w-5xl flex-col gap-4 p-4 sm:p-6'>
        <div className='flex items-center justify-end gap-2'>
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

        <Dialog open={showJSON} onOpenChange={open => setShowJSON(open)}>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>videos JSON</DialogTitle>
            </DialogHeader>
            <div className='flex flex-col gap-3'>
              <Textarea
                ref={JSONInputRef}
                value={JSONText}
                onChange={e => setJSONText(e.target.value)}
                rows={18}
              />
              <div className='flex justify-end'>
                <Button
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(JSONText)
                      setVideos('videos', parsed)
                      setShowJSON(false)
                    } catch {
                      showToast('Invalid JSON')
                    }
                  }}
                >
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle>Load a source</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <div className='text-sm font-medium'>YouTube URL</div>
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
            </div>

            <div className='grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center'>
              <FileUpload
                accept='audio/*,video/*'
                onFileSelect={handleLocalFileSelect}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    className='w-full sm:w-auto'
                    onClick={() => setShowJSON(true)}
                  >
                    <Code2 className='mr-2' />
                    show code
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Show raw saved data</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {videos && videoList.length > 0 && (
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle>Recents</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-1'>
              {videoList.map(e => (
                <button
                  key={e}
                  onClick={() => showVideoId(e)}
                  className='flex flex-col md:flex-row w-full items-start md:items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent'
                >
                  <div className='min-w-0 flex-1 w-full font-medium text-primary'>
                    {videos[e].title ?? e}
                  </div>
                  <div className='shrink-0 text-xs text-muted-foreground'>
                    {formatTimeString(videos[e]['last_accessed'])}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  ) : (
    <Player id={id} setShowPlayer={setShowPlayer} showToast={showToast} />
  )
}
