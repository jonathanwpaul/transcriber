import { useEffect, useRef, useState } from 'react'
import { Code2, Moon, Sun } from 'lucide-react'

import { VideoPlayer } from './VideoPlayer/VideoPlayer'
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

const ACCEPTED_AUDIO_EXTENSIONS = ['mp3', 'wav']
const ACCEPTED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
]

function makeLocalFileId(file) {
  return `file:${file.name}:${file.size}:${file.lastModified}`
}

function isAcceptedAudioFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (ACCEPTED_AUDIO_EXTENSIONS.includes(ext)) return true
  if (ACCEPTED_AUDIO_MIME_TYPES.includes(file.type)) return true
  return false
}

export const Home = ({ showToast, themeMode, setThemeMode }) => {
  const [id, setId] = useState()
  const [showVideoPlayer, setShowVideoPlayer] = useState()
  const [inputText, setInputText] = useState()
  const [error, setError] = useState(false)
  const {
    preference: videosString,
    loading,
    setValue: setVideos,
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
      setShowVideoPlayer(true)
    })
  }

  const handleLocalFileSelect = file => {
    if (!file) return

    if (!isAcceptedAudioFile(file)) {
      showToast('Please select a .mp3 or .wav file')
      return
    }

    const id = makeLocalFileId(file)
    const newSourceUrl = URL.createObjectURL(file)

    const existing = videos[id]
    if (existing?.sourceUrl && existing.sourceUrl.startsWith('blob:')) {
      // Revoke prior object URL to avoid leaks
      URL.revokeObjectURL(existing.sourceUrl)
    }

    videos[id] = {
      ...(videos[id] || {}),
      type: videoSources.FILE,
      title: file.name,
      fileName: file.name,
      fileSize: file.size,
      lastModified: file.lastModified,
      mimeType: file.type,
      sourceUrl: newSourceUrl,
    }

    showVideoId(id)
  }

  const handleSubmit = () => {
    const id = getId(inputText)
    if (!id) return
    if (!videos[id]) videos[id] = { type: videoSources.YOUTUBE }
    showVideoId(id)
  }

  const formatTimeString = timeString => new Date(timeString).toLocaleString()

  const videoList = Object.keys(videos).sort((a, b) =>
    videos[a]['last_accessed'] > videos[b]['last_accessed'] ? -1 : 1,
  )

  // if there's a cached entry and not one already selected, use that
  // if (videoList.length > 0 && !showVideoPlayer && !id) {
  //   setId(videoList[0])
  //   setShowVideoPlayer(true)
  // }

  return !showVideoPlayer ? (
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
                accept='.mp3,.wav,audio/mpeg,audio/wav'
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
                  className='flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent'
                >
                  <div className='min-w-0 flex-1 truncate font-medium text-primary'>
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
    <VideoPlayer
      id={id}
      setShowVideoPlayer={setShowVideoPlayer}
      showToast={showToast}
    />
  )
}
