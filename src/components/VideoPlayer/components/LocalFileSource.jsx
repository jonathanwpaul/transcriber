import { useEffect, useMemo, useRef, useState } from 'react'

import { FileMusic } from 'lucide-react'

import { videoSources } from '@utils/constants'

import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { Slider } from '@components/ui/slider'

const ACCEPT = '.mp3,.wav,audio/mpeg,audio/wav'

function makeLocalFileId(file) {
  return `file:${file.name}:${file.size}:${file.lastModified}`
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

export const LocalFileSource = ({
  id,
  onPause,
  onPlay,
  playerRef,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setPlaybackRate,
  setSectionEnd,
  setSectionStart,
  setVideos,
  showToast,
  videos,
}) => {
  const entry = videos[id] || {}
  const sourceUrl = entry.sourceUrl

  const audioElRef = useRef(null)
  const fileInputRef = useRef(null)

  // WebAudio graph refs
  const audioCtxRef = useRef(null)
  const sourceNodeRef = useRef(null)
  const eqNodesRef = useRef([])
  const highPassRef = useRef(null)
  const lowPassRef = useRef(null)

  const eqBands = useMemo(
    () => [
      { label: '60', freq: 60 },
      { label: '170', freq: 170 },
      { label: '350', freq: 350 },
      { label: '1k', freq: 1000 },
      { label: '3.5k', freq: 3500 },
      { label: '10k', freq: 10000 },
    ],
    [],
  )

  const [eqGains, setEqGains] = useState(() =>
    Array.isArray(entry.eqGains) && entry.eqGains.length === eqBands.length
      ? entry.eqGains
      : eqBands.map(() => 0),
  )

  const [highPassEnabled, setHighPassEnabled] = useState(
    () => !!entry.highPassEnabled,
  )
  const [highPassFreq, setHighPassFreq] = useState(() => entry.highPassFreq ?? 80)
  const [lowPassEnabled, setLowPassEnabled] = useState(() => !!entry.lowPassEnabled)
  const [lowPassFreq, setLowPassFreq] = useState(() => entry.lowPassFreq ?? 12000)

  // Keep persisted settings in sync
  useEffect(() => {
    if (!videos[id]) return
    const next = {
      ...videos[id],
      type: videoSources.FILE,
      eqGains,
      highPassEnabled,
      highPassFreq,
      lowPassEnabled,
      lowPassFreq,
    }
    // Avoid spamming Preferences on every slider tick by only saving when values change.
    // This effect already runs on changes, but can still be frequent; acceptable for now.
    setVideos('videos', { ...videos, [id]: next })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eqGains, highPassEnabled, highPassFreq, lowPassEnabled, lowPassFreq])

  const ensureAudioContext = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume()
    }
  }

  const rebuildGraph = async () => {
    const audio = audioElRef.current
    if (!audio) return

    await ensureAudioContext()

    // Clean up existing graph connections
    try {
      sourceNodeRef.current?.disconnect()
    } catch {}
    eqNodesRef.current.forEach(n => {
      try {
        n.disconnect()
      } catch {}
    })
    eqNodesRef.current = []

    const ctx = audioCtxRef.current

    // MediaElementSource can only be created once per audio element
    if (!sourceNodeRef.current) {
      sourceNodeRef.current = ctx.createMediaElementSource(audio)
    }

    // EQ nodes
    const eqNodes = eqBands.map((b, idx) => {
      const node = ctx.createBiquadFilter()
      node.type = 'peaking'
      node.frequency.value = b.freq
      node.Q.value = 1
      node.gain.value = eqGains[idx] ?? 0
      return node
    })
    eqNodesRef.current = eqNodes

    // Filters
    if (!highPassRef.current) {
      highPassRef.current = ctx.createBiquadFilter()
      highPassRef.current.type = 'highpass'
    }

    if (!lowPassRef.current) {
      lowPassRef.current = ctx.createBiquadFilter()
      lowPassRef.current.type = 'lowpass'
    }

    // Connect: source -> EQ... -> HP -> LP -> destination
    let prev = sourceNodeRef.current
    eqNodes.forEach(n => {
      prev.connect(n)
      prev = n
    })

    prev.connect(highPassRef.current)
    highPassRef.current.connect(lowPassRef.current)
    lowPassRef.current.connect(ctx.destination)

    // Apply initial filter params
    const nyquist = ctx.sampleRate / 2
    highPassRef.current.frequency.value = clamp(
      highPassEnabled ? highPassFreq : 0,
      0,
      nyquist,
    )
    lowPassRef.current.frequency.value = clamp(
      lowPassEnabled ? lowPassFreq : nyquist,
      0,
      nyquist,
    )
  }

  // Apply EQ/filter changes to nodes
  useEffect(() => {
    eqNodesRef.current.forEach((n, idx) => {
      n.gain.value = eqGains[idx] ?? 0
    })
  }, [eqGains])

  useEffect(() => {
    const ctx = audioCtxRef.current
    if (!ctx || !highPassRef.current || !lowPassRef.current) return

    const nyquist = ctx.sampleRate / 2
    highPassRef.current.frequency.value = clamp(
      highPassEnabled ? highPassFreq : 0,
      0,
      nyquist,
    )
    lowPassRef.current.frequency.value = clamp(
      lowPassEnabled ? lowPassFreq : nyquist,
      0,
      nyquist,
    )
  }, [highPassEnabled, highPassFreq, lowPassEnabled, lowPassFreq])

  // When source URL changes, load into audio element and rebuild graph
  useEffect(() => {
    const audio = audioElRef.current
    if (!audio || !sourceUrl) return

    audio.src = sourceUrl
    audio.load()

    const onLoadedMetadata = () => {
      const dur = audio.duration || 0
      setDuration(dur)
      setCurrentTime(audio.currentTime || 0)
      setIsPlaying(!audio.paused)
      setPlaybackRate(audio.playbackRate || 1)
      setSectionStart(0)
      setSectionEnd(dur)
    }

    const onPlayEvent = () => {
      setIsPlaying(true)
      onPlay?.()
    }

    const onPauseEvent = () => {
      setIsPlaying(false)
      onPause?.()
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('play', onPlayEvent)
    audio.addEventListener('pause', onPauseEvent)

    // Build the WebAudio graph after metadata is available
    rebuildGraph().catch(err => {
      console.error('Failed to init audio graph', err)
    })

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('play', onPlayEvent)
      audio.removeEventListener('pause', onPauseEvent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceUrl])

  // Provide a VideoPlayer-compatible adapter
  useEffect(() => {
    playerRef.current = {
      play: async () => {
        const audio = audioElRef.current
        if (!audio) return
        await ensureAudioContext()
        await audio.play()
      },
      pause: () => {
        audioElRef.current?.pause()
      },
      seekTo: seconds => {
        const audio = audioElRef.current
        if (!audio) return
        audio.currentTime = clamp(seconds, 0, audio.duration || 0)
      },
      getCurrentTime: () => audioElRef.current?.currentTime || 0,
      getDuration: () => audioElRef.current?.duration || 0,
      setPlaybackRate: rate => {
        const audio = audioElRef.current
        if (!audio) return
        audio.playbackRate = rate
        setPlaybackRate(rate)
      },
    }

    return () => {
      // keep playerRef around; VideoPlayer will null it on close
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilePick = file => {
    if (!file) return
    const nextId = makeLocalFileId(file)
    const newSourceUrl = URL.createObjectURL(file)

    // revoke prior blob URL if present
    if (videos[nextId]?.sourceUrl && videos[nextId].sourceUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videos[nextId].sourceUrl)
    }

    const nextEntry = {
      ...(videos[nextId] || {}),
      type: videoSources.FILE,
      title: file.name,
      fileName: file.name,
      fileSize: file.size,
      lastModified: file.lastModified,
      mimeType: file.type,
      sourceUrl: newSourceUrl,
    }

    // If user picked a file while inside a different id, we overwrite current id entry
    // only when it matches; otherwise tell them to go back to Home recents.
    if (nextId !== id) {
      showToast?.('Loaded file. Use Recents to open it after this screen.')
      setVideos('videos', { ...videos, [nextId]: nextEntry })
      return
    }

    setVideos('videos', { ...videos, [id]: nextEntry })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-md border bg-background p-2">
              <FileMusic className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {entry.fileName || entry.title || 'Local audio file'}
              </div>
              <div className="text-xs text-muted-foreground">
                {sourceUrl ? 'Ready' : 'No file loaded yet'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={e => handleFilePick(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {sourceUrl ? 'Change file' : 'Choose file'}
            </Button>
          </div>
        </div>

        {/* Hidden audio element; playback is controlled via app UI */}
        <audio ref={audioElRef} className="hidden" />
      </Card>

      {/* Extra ear-training / transcription tools (local files only) */}
      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Equalizer</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {eqBands.map((b, idx) => (
            <div key={b.freq} className="rounded-md border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-medium">{b.label}Hz</div>
                <div className="text-xs text-muted-foreground">{eqGains[idx]} dB</div>
              </div>
              <Slider
                min={-12}
                max={12}
                step={1}
                value={[eqGains[idx] ?? 0]}
                onValueChange={val => {
                  const next = [...eqGains]
                  next[idx] = val[0]
                  setEqGains(next)
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <Button type="button" variant="ghost" onClick={() => setEqGains(eqBands.map(() => 0))}>
            Reset EQ
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Filters</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border bg-card p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-xs font-medium">High-pass</div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={highPassEnabled}
                  onChange={e => setHighPassEnabled(e.target.checked)}
                />
                enabled
              </label>
            </div>
            <div className="mb-2 text-xs text-muted-foreground">cutoff: {highPassFreq} Hz</div>
            <Slider
              min={20}
              max={2000}
              step={10}
              value={[highPassFreq]}
              onValueChange={val => setHighPassFreq(val[0])}
            />
          </div>

          <div className="rounded-md border bg-card p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-xs font-medium">Low-pass</div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={lowPassEnabled}
                  onChange={e => setLowPassEnabled(e.target.checked)}
                />
                enabled
              </label>
            </div>
            <div className="mb-2 text-xs text-muted-foreground">cutoff: {lowPassFreq} Hz</div>
            <Slider
              min={2000}
              max={20000}
              step={100}
              value={[lowPassFreq]}
              onValueChange={val => setLowPassFreq(val[0])}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="text-xs text-muted-foreground">Tip: use HP to cut rumble, LP to focus on melody.</div>
        </div>
      </Card>
    </div>
  )
}
