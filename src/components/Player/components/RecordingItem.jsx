import { useState, useEffect, useRef } from 'react'
import { Pause, Play, Trash2 } from 'lucide-react'

import { getAudioSrc, removeRecordingFile } from '@lib/media/RecordingService'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'

function Waveform({ src }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!src || !canvasRef.current) return
    let cancelled = false

    async function draw() {
      try {
        const res = await fetch(src)
        const arrayBuffer = await res.arrayBuffer()
        const ctx = new AudioContext()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        await ctx.close()

        if (cancelled || !canvasRef.current) return

        const canvas = canvasRef.current
        const { width, height } = canvas
        const data = audioBuffer.getChannelData(0)
        const buckets = width
        const bucketSize = Math.floor(data.length / buckets)

        const points = []
        for (let i = 0; i < buckets; i++) {
          let max = 0
          for (let j = 0; j < bucketSize; j++) {
            const v = Math.abs(data[i * bucketSize + j] || 0)
            if (v > max) max = v
          }
          points.push(max)
        }

        const drawCtx = canvas.getContext('2d')
        const style = getComputedStyle(canvas)
        const color = style.getPropertyValue('--waveform-color').trim() || 'hsl(174 72% 40%)'

        drawCtx.clearRect(0, 0, width, height)
        drawCtx.fillStyle = color
        const mid = height / 2
        const scale = mid * 0.9

        for (let i = 0; i < points.length; i++) {
          const h = Math.max(1, points[i] * scale)
          drawCtx.fillRect(i, mid - h, 1, h * 2)
        }
      } catch {
        // audio decode failed — leave canvas blank
      }
    }

    draw()
    return () => {
      cancelled = true
    }
  }, [src])

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={32}
      className='h-8 w-full'
      style={{ '--waveform-color': 'hsl(var(--primary))' }}
    />
  )
}

export function RecordingItem({ recording, onDeleted }) {
  const [src, setSrc] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    getAudioSrc(recording.file_path, null, recording.file_directory).then(url => {
      if (!cancelled) setSrc(url)
    })
    return () => {
      cancelled = true
    }
  }, [recording.file_path])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const handleDelete = async () => {
    setConfirmOpen(false)
    await removeRecordingFile(recording.id)
    onDeleted(recording.id)
  }

  const formattedDate = new Date(recording.created_on).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className='flex items-center gap-2 px-3 py-1'>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <Button
        type='button'
        size='icon'
        variant='ghost'
        className='h-7 w-7 shrink-0'
        onClick={togglePlay}
        disabled={!src}
        aria-label={isPlaying ? 'Pause recording' : 'Play recording'}
      >
        {isPlaying ? <Pause className='h-3.5 w-3.5' /> : <Play className='h-3.5 w-3.5' />}
      </Button>

      <div className='min-w-0 flex-1'>
        <Waveform src={src} />
      </div>

      <span className='shrink-0 text-xs text-muted-foreground'>{formattedDate}</span>

      <Button
        type='button'
        size='icon'
        variant='ghost'
        className='h-7 w-7 shrink-0'
        onClick={() => setConfirmOpen(true)}
        aria-label='Delete recording'
      >
        <Trash2 className='h-3.5 w-3.5' />
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete recording?</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-muted-foreground'>This cannot be undone.</p>
          <div className='flex justify-end gap-2 pt-2'>
            <Button variant='outline' onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
