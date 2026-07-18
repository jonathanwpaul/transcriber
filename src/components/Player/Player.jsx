import _ from 'lodash'
import { useState, useRef, useEffect } from 'react'
import { Cog, X } from 'lucide-react'

import { getAppSetting, setAppSetting } from '@lib/storage/dbService'
import { useLoading } from '@lib/LoadingContext'
import { round } from '@utils/video'
import { YouTubePlayer, LocalFilePlayer } from '../../lib/media'

import { EQ_PRESETS, SongSettings } from './components'
import { Button, Card } from '../ui'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

import { PlayerLayout } from './PlayerLayout'

export const Player = ({ id, type, setShowPlayer }) => {
  const { setIsLoading } = useLoading()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [loopStart, setLoopStart] = useState(0)
  const [loopEnd, setLoopEnd] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [scrubTime, setScrubTime] = useState(currentTime)
  const [collapsedLoops, setCollapsedLoops] = useState({})
  const [playerMetadata, setPlayerMetadata] = useState({})
  const [appSettings, setAppSettingsState] = useState({
    measures: 4,
    useSelectedAsParent: true,
  })
  const [appSettingsLoading, setAppSettingsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [eqGains, setEqGains] = useState([20, 0, 0, 0, 0, 0, 20000])
  const [eqPreset, setEqPreset] = useState('flat')
  const [showVideo, setShowVideo] = useState(true)
  const [loopEnabled, setLoopEnabled] = useState(true)

  const mediaPlayerRef = useRef(null)
  const loopStartRef = useRef()
  const loopEndRef = useRef()
  const loopEnabledRef = useRef(loopEnabled)
  loopStartRef.current = loopStart
  loopEndRef.current = loopEnd
  loopEnabledRef.current = loopEnabled

  const controlsDisabled = !mediaPlayerRef.current
  const measures = appSettings['measures']

  useEffect(() => {
    Promise.all([
      getAppSetting('measures', 4),
      getAppSetting('useSelectedAsParent', true),
    ]).then(([measures, useSelectedAsParent]) => {
      setAppSettingsState({ measures, useSelectedAsParent })
      setAppSettingsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!isScrubbing) {
      setScrubTime(currentTime)
    }
  }, [currentTime, isScrubbing])

  useEffect(() => {
    if (!id) {
      if (mediaPlayerRef.current) {
        mediaPlayerRef.current.destroy?.()
        mediaPlayerRef.current = null
      }
      return
    }

    setIsLoading(true)

    let PlayerClass = null
    if (type === 'file') {
      PlayerClass = LocalFilePlayer
    } else {
      PlayerClass = YouTubePlayer
    }

    if (!PlayerClass) {
      if (mediaPlayerRef.current) {
        mediaPlayerRef.current.destroy?.()
        mediaPlayerRef.current = null
      }
      return
    }

    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.destroy?.()
      mediaPlayerRef.current = null
    }

    const callbacks = {
      onReady: ({ duration: d, currentTime: ct, playbackRate: pr }) => {
        setDuration(d)
        setCurrentTime(ct)
        setPlaybackRate(pr)
        setLoopStart(0)
        setLoopEnd(d)
        setIsLoading(false)
      },
      onDuration: d => setDuration(d),
      onTimeUpdate: t => {
        const rounded = round(t)
        setCurrentTime(rounded)
        if (loopEnabledRef.current && t > loopEndRef.current) {
          handleSeek(loopStartRef.current)
        }
      },
      onPlaybackRateChange: r => setPlaybackRate(r),
      onPlayingChange: playing => setIsPlaying(playing),
      onMetadataChange: meta => {
        setPlayerMetadata(meta)
        if (typeof meta.showVideo === 'boolean') setShowVideo(meta.showVideo)
        if (typeof meta.loopEnabled === 'boolean')
          setLoopEnabled(meta.loopEnabled)
      },
    }

    const player = new PlayerClass({ id, callbacks })
    mediaPlayerRef.current = player

    return () => {
      player.destroy?.()
      if (mediaPlayerRef.current === player) {
        mediaPlayerRef.current = null
      }
      setIsLoading(false)
    }
  }, [id, type])

  const handlePlay = () => mediaPlayerRef.current.play()

  const handlePause = () => {
    mediaPlayerRef.current.pause()
    if (mediaPlayerRef.current.setLastPlaybackPosition) {
      mediaPlayerRef.current
        .setLastPlaybackPosition(currentTime)
        .catch(() => {})
    }
  }

  const handleSeek = newValue => {
    if (!mediaPlayerRef.current) return
    const target = round(newValue)
    setCurrentTime(target)
    mediaPlayerRef.current.seekTo(target)
  }

  const restartPlayer = () => handleSeek(0)

  const restartLoop = () => {
    if (!mediaPlayerRef.current) return
    setCurrentTime(loopStart)
    mediaPlayerRef.current.seekTo(loopStart)
  }

  const handlePlaybackRateChange = newValue => {
    if (!mediaPlayerRef.current) return
    setPlaybackRate(newValue)
    mediaPlayerRef.current.setPlaybackRate(newValue)
    if (mediaPlayerRef.current.setLastPlaybackRate) {
      mediaPlayerRef.current.setLastPlaybackRate(newValue).catch(() => {})
    }
  }

  const handleIntervalChange = newValue => {
    const minTime = 1
    let [newStart, newEnd] = newValue

    if (newEnd - newStart < minTime) {
      newEnd = newStart + minTime
    }

    newStart = Math.max(0, Math.min(newStart, duration))
    newEnd = Math.max(0, Math.min(newEnd, duration))

    const roundedStart = round(newStart)
    const roundedEnd = round(newEnd)

    setLoopStart(roundedStart)
    setLoopEnd(roundedEnd)

    if (mediaPlayerRef.current?.setLastSectionPositions) {
      mediaPlayerRef.current
        .setLastSectionPositions(roundedStart, roundedEnd)
        .catch(() => {})
    }

    if (currentTime < newStart) handleSeek(newStart)
    if (currentTime > newEnd) handleSeek(newEnd)
  }

  const handleLoopStartChange = value => {
    setLoopStart(value)
  }

  const handleLoopEndChange = value => {
    setLoopEnd(value)
  }

  const handleCurrentTimeChange = value => {
    setCurrentTime(value)
    mediaPlayerRef.current?.seekTo(value)
  }

  const markLoopStart = () => {
    const newStart = round(currentTime)
    setLoopStart(newStart)
    if (mediaPlayerRef.current?.setLastSectionPositions) {
      mediaPlayerRef.current
        .setLastSectionPositions(newStart, loopEnd)
        .catch(() => {})
    }
  }

  const markLoopEnd = () => {
    const newEnd = round(currentTime)
    setLoopEnd(newEnd)
    if (mediaPlayerRef.current?.setLastSectionPositions) {
      mediaPlayerRef.current
        .setLastSectionPositions(loopStart, newEnd)
        .catch(() => {})
    }
  }

  const calculatePath = (loops, loop, path = '') => {
    const getLoopDistance = k =>
      loop.loopStart - loops[k].loopStart + loops[k].loopEnd - loop.loopEnd
    const parentKeys = Object.keys(loops)
      .filter(
        k =>
          loops[k].loopStart <= loop.loopStart &&
          loops[k].loopEnd >= loop.loopEnd,
      )
      .sort((a, b) => getLoopDistance(a) - getLoopDistance(b))

    if (parentKeys.length === 0) {
      return path + `${loop.loopStart}-${loop.loopEnd}`
    }
    return calculatePath(
      loops[parentKeys[0]]?.children || {},
      loop,
      path + parentKeys[0] + '/children/',
    )
  }

  const saveLoop = () => {
    const currentLoops = playerMetadata.loops || {}
    const nextLoops = _.cloneDeep(currentLoops)
    const path = calculatePath(nextLoops, { loopStart, loopEnd })
    const existing = _.get(nextLoops, path, {})
    _.set(nextLoops, path.split('/'), { ...existing, loopStart, loopEnd })
    mediaPlayerRef.current.setLoops(nextLoops)
  }

  const loadLoop = loop => {
    const start = loop['loopStart']
    const end = loop['loopEnd']
    setLoopStart(start)
    setLoopEnd(end)
    setCurrentTime(start)
    if (mediaPlayerRef.current) {
      if (mediaPlayerRef.current.setLastSectionPositions) {
        mediaPlayerRef.current
          .setLastSectionPositions(start, end)
          .catch(() => {})
      }
      mediaPlayerRef.current.seekTo(start)
      mediaPlayerRef.current.play()
    }
  }

  const deleteLoop = loop => {
    if (!mediaPlayerRef.current) return
    const currentLoops = playerMetadata.loops
    const nextLoops = _.omit(currentLoops, `${loop.loopStart}-${loop.loopEnd}`)
    mediaPlayerRef.current.setLoops(nextLoops).catch(() => {})
  }

  const handleLoopTitleChange = (pathKey, title) => {
    if (!mediaPlayerRef.current) return
    const currentLoops = playerMetadata.loops
    const nextLoops = _.cloneDeep(currentLoops)
    const segments = pathKey.split('/')
    const existingLoop = _.get(nextLoops, segments, {})
    _.set(nextLoops, segments, { ...existingLoop, title })
    mediaPlayerRef.current.setLoops(nextLoops).catch(() => {})
  }

  const handleMeasuresChange = newMeasures => {
    const next = { ...appSettings, measures: newMeasures }
    setAppSettingsState(next)
    setAppSetting('measures', newMeasures).catch(() => {})
  }

  const handleEqBandChange = (index, gain) => {
    const next = [...eqGains]
    next[index] = gain
    setEqGains(next)
    setEqPreset(null)
    mediaPlayerRef.current?.setEqGains?.(next)
  }

  const handleEqPresetChange = preset => {
    const next = EQ_PRESETS[preset]
    setEqGains(next)
    setEqPreset(preset)
    mediaPlayerRef.current?.setEqGains?.(next)
  }

  const handleBpmChange = newBpm => {
    mediaPlayerRef.current.setBpm(newBpm)
  }

  const handleBeatsPerMeasureChange = newBeatsPerMeasure => {
    mediaPlayerRef.current.setBeatsPerMeasure(newBeatsPerMeasure)
  }

  const handleShowVideoChange = nextShowVideo => {
    setShowVideo(nextShowVideo)
    mediaPlayerRef.current?._saveMetadata?.({ showVideo: nextShowVideo })
  }

  const handleLoopEnabledChange = nextLoopEnabled => {
    setLoopEnabled(nextLoopEnabled)
    mediaPlayerRef.current?._saveMetadata?.({ loopEnabled: nextLoopEnabled })
  }

  const handleCloseVideo = () => {
    if (mediaPlayerRef.current) {
      if (mediaPlayerRef.current.setLastPlaybackPosition) {
        mediaPlayerRef.current
          .setLastPlaybackPosition(currentTime)
          .catch(() => {})
      }
      mediaPlayerRef.current.destroy?.()
      mediaPlayerRef.current = null
    }
    setShowPlayer(false)
  }

  if (!mediaPlayerRef.current || appSettingsLoading) return <p>loading...</p>

  const isVideo =
    type !== 'file' || playerMetadata.mimeType?.startsWith('video')

  const layoutProps = {
    mediaPlayerRef,
    currentTime,
    duration,
    loopStart,
    loopEnd,
    playbackRate,
    isPlaying,
    isScrubbing,
    scrubTime,
    controlsDisabled,
    playerMetadata,
    measures,
    collapsedLoops,
    setCollapsedLoops,
    eqGains,
    eqPreset,
    type,
    isVideo,
    showVideo,
    loopEnabled,
    onLoopEnabledChange: handleLoopEnabledChange,
    name: playerMetadata.name,
    onIntervalChange: handleIntervalChange,
    onSeek: handleSeek,
    onScrubStart: val => {
      setIsScrubbing(true)
      setScrubTime(val)
    },
    onScrubEnd: val => {
      setIsScrubbing(false)
      handleSeek(val)
    },
    onPlay: handlePlay,
    onPause: handlePause,
    onRestartPlayer: restartPlayer,
    onRestartLoop: restartLoop,
    onMarkLoopStart: markLoopStart,
    onMarkLoopEnd: markLoopEnd,
    onSaveLoop: saveLoop,
    onPlaybackRateChange: handlePlaybackRateChange,
    onLoopStartChange: handleLoopStartChange,
    onLoopEndChange: handleLoopEndChange,
    onCurrentTimeChange: handleCurrentTimeChange,
    onMeasuresChange: handleMeasuresChange,
    onLoadLoop: loadLoop,
    onDeleteLoop: deleteLoop,
    onTitleChange: handleLoopTitleChange,
    onBpmChange: handleBpmChange,
    onBeatsPerMeasureChange: handleBeatsPerMeasureChange,
    onEqBandChange: handleEqBandChange,
    onEqPresetChange: handleEqPresetChange,
  }

  return (
    <TooltipProvider>
      <div className='h-full w-full flex flex-col'>
        <Card className='mx-2 my-1 flex flex-none items-center sm:h-[5vh] sm:px-4'>
          <div className='hidden min-w-0 flex-1 truncate text-sm font-medium sm:block'>
            {playerMetadata.name}
          </div>
          <div className='flex items-center gap-1'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='xs'
                  onClick={() => setShowSettings(s => !s)}
                  aria-label='Song settings'
                  className='hidden sm:inline-flex'
                >
                  <Cog />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Song settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='xs'
                  disabled={controlsDisabled}
                  onClick={handleCloseVideo}
                  aria-label='Close'
                  className='hidden sm:inline-flex'
                >
                  <X />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close</TooltipContent>
            </Tooltip>
          </div>
        </Card>

        <PlayerLayout
          {...layoutProps}
          onClose={handleCloseVideo}
          showVideo={showVideo}
          onShowVideoChange={handleShowVideoChange}
        />
        <SongSettings
          asDialog
          hideHeader
          open={showSettings}
          onOpenChange={setShowSettings}
          type={type}
          bpm={playerMetadata.bpm}
          beatsPerMeasure={playerMetadata.beatsPerMeasure}
          onBpmChange={handleBpmChange}
          onBeatsPerMeasureChange={handleBeatsPerMeasureChange}
          gains={eqGains}
          onBandChange={handleEqBandChange}
          activePreset={eqPreset}
          onPresetChange={handleEqPresetChange}
          playerRef={mediaPlayerRef}
          showVideo={showVideo}
          onShowVideoChange={handleShowVideoChange}
        />
      </div>
    </TooltipProvider>
  )
}
