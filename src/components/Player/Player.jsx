import _ from 'lodash'
import { useState, useRef, useEffect } from 'react'
import {
  ArrowBigLeftDash,
  ArrowBigRightDash,
  Flag,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Save,
  SkipBack,
  X,
} from 'lucide-react'

import { getAppSetting, setAppSetting } from '@lib/storage/dbService'
import { timestampFormatter, round } from '@utils/video'
import { YouTubePlayer, LocalFilePlayer } from '../../lib/media'

import {
  BPMInput,
  TimeTextInput,
  SavedSection,
  ScrubbableNumberInput,
} from './components'

import { Button, Card, Separator, Slider } from '../ui'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { SeparatorVertical } from 'lucide-react'

export const Player = ({ id, type, setShowPlayer, showToast }) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [loopStart, setLoopStart] = useState(0)
  const [loopEnd, setLoopEnd] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [scrubTime, setScrubTime] = useState(currentTime)

  // collapse state for loop tree nodes, keyed by a stable path string
  const [collapsedLoops, setCollapsedLoops] = useState({})
  // metadata emitted by the MediaPlayer (BPM, beats/measure, loops, etc.)
  const [playerMetadata, setPlayerMetadata] = useState({})

  const [appSettings, setAppSettingsState] = useState({
    measures: 4,
    useSelectedAsParent: true,
  })
  const [appSettingsLoading, setAppSettingsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAppSetting('measures', 4),
      getAppSetting('useSelectedAsParent', true),
    ]).then(([measures, useSelectedAsParent]) => {
      setAppSettingsState({ measures, useSelectedAsParent })
      setAppSettingsLoading(false)
    })
  }, [])

  const measures = appSettings['measures']

  const [isRhythmLocked, setIsRhythmLocked] = useState(false)

  useEffect(() => {
    if (!isScrubbing) {
      setScrubTime(currentTime)
    }
  }, [currentTime, isScrubbing])

  const mediaPlayerRef = useRef(null)
  const loopStartRef = useRef()
  const loopEndRef = useRef()
  loopStartRef.current = loopStart
  loopEndRef.current = loopEnd

  // disable controls until the underlying player has mounted
  const controlsDisabled = !mediaPlayerRef.current

  const handlePlay = () => {
    mediaPlayerRef.current.play()
  }

  const handlePause = () => {
    mediaPlayerRef.current.pause()
    if (mediaPlayerRef.current.setLastPlaybackPosition) {
      mediaPlayerRef.current
        .setLastPlaybackPosition(currentTime)
        .catch(() => {})
    }
  }

  /**
   * moves the slider to the start
   */
  const restartPlayer = () => {
    handleSeek(0)
  }

  const handleSeek = newValue => {
    if (!mediaPlayerRef.current) return
    const target = round(newValue)

    // Immediately move React state and the underlying player.
    setCurrentTime(target)
    mediaPlayerRef.current.seekTo(target)
  }

  const handlePlaybackRateChange = newValue => {
    if (!mediaPlayerRef.current) return
    setPlaybackRate(newValue)
    mediaPlayerRef.current.setPlaybackRate(newValue)
    if (mediaPlayerRef.current.setLastPlaybackRate) {
      mediaPlayerRef.current.setLastPlaybackRate(newValue).catch(() => {})
    }
  }

  // Create / recreate the underlying MediaPlayer instance when the id or source changes.
  useEffect(() => {
    if (!id) {
      if (mediaPlayerRef.current) {
        mediaPlayerRef.current.destroy?.()
        mediaPlayerRef.current = null
      }
      return
    }

    let PlayerClass = null
    if (type === 'file') {
      PlayerClass = LocalFilePlayer
    } else {
      PlayerClass = YouTubePlayer
    }

    // If we don't recognize the type, clean up and bail.
    if (!PlayerClass) {
      if (mediaPlayerRef.current) {
        mediaPlayerRef.current.destroy?.()
        mediaPlayerRef.current = null
      }
      return
    }

    // Destroy any existing player instance before creating a new one.
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.destroy?.()
      mediaPlayerRef.current = null
    }

    const callbacks = {
      onReady: ({
        duration: d,
        currentTime: ct,
        playbackRate: pr,
        rhythmLocked,
      }) => {
        setDuration(d)
        setCurrentTime(ct)
        setPlaybackRate(pr)
        setLoopStart(0)
        setLoopEnd(d)
        setIsRhythmLocked(rhythmLocked)
      },
      onDuration: d => setDuration(d),
      onTimeUpdate: t => {
        const rounded = round(t)
        setCurrentTime(rounded)
        if (t > loopEndRef.current) {
          handleSeek(loopStartRef.current)
        }
      },
      onPlaybackRateChange: r => setPlaybackRate(r),
      onPlayingChange: playing => setIsPlaying(playing),
      onMetadataChange: meta => setPlayerMetadata(meta),
    }

    const player = new PlayerClass({
      id,
      callbacks,
    })

    mediaPlayerRef.current = player

    return () => {
      player.destroy?.()
      if (mediaPlayerRef.current === player) {
        mediaPlayerRef.current = null
      }
    }
  }, [id, type])

  const handleIntervalChange = newValue => {
    const minTime = 1
    let [newStart, newEnd] = newValue

    // enforce minimum width
    if (newEnd - newStart < minTime) {
      newEnd = newStart + minTime
    }

    // clamp
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

    // keep playhead within loop
    if (currentTime < newStart) handleSeek(newStart)
    if (currentTime > newEnd) handleSeek(newEnd)
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

  /**
   * this calculates the path of a given loop using the start and end times.
   */
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

    //find the path that this loop belongs into (nesting)
    const path = calculatePath(nextLoops, {
      loopStart,
      loopEnd,
    })

    const existing = _.get(nextLoops, path, {})

    _.set(nextLoops, path.split('/'), {
      ...existing, // for any other fields we want to save with loops
      loopStart,
      loopEnd,
    })

    mediaPlayerRef.current.setLoops(nextLoops)
  }

  const deleteLoop = loop => {
    if (!mediaPlayerRef.current) return
    const currentLoops = playerMetadata.loops
    const nextLoops = _.omit(currentLoops, `${loop.loopStart}-${loop.loopEnd}`)
    mediaPlayerRef.current.setLoops(nextLoops).catch(() => {})
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

  const restartLoop = () => {
    if (!mediaPlayerRef.current) return
    setCurrentTime(loopStart)
    mediaPlayerRef.current.seekTo(loopStart)
  }

  const renderLoop = (loop, pathKey) => {
    const hasChildren = !!(
      loop.children && Object.keys(loop.children).length > 0
    )
    const isCollapsed = !!collapsedLoops[pathKey]

    return (
      <div key={pathKey} className='flex flex-col gap-2'>
        <SavedSection
          endTime={loop.loopEnd}
          isSelected={loop.loopStart === loopStart && loop.loopEnd === loopEnd}
          onClick={() => loadLoop(loop)}
          onDelete={() => deleteLoop(loop)}
          onTitleChange={title => {
            if (!mediaPlayerRef.current) return
            const currentLoops = playerMetadata.loops
            const nextLoops = _.cloneDeep(currentLoops)
            // pathKey uses loopStart-loopEnd chain; use it directly to locate this loop
            const segments = pathKey.split('/')
            const existingLoop = _.get(nextLoops, segments, {})
            _.set(nextLoops, segments, {
              ...existingLoop,
              title,
            })
            mediaPlayerRef.current.setLoops(nextLoops).catch(() => {})
          }}
          startTime={loop.loopStart}
          title={loop.title}
          hasChildren={hasChildren}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => {
            setCollapsedLoops(prev => ({ ...prev, [pathKey]: !prev[pathKey] }))
          }}
        />

        {hasChildren && !isCollapsed && (
          <div className='pl-4'>
            {Object.values(loop.children).map(child => {
              const childKey = `${child.loopStart}-${child.loopEnd}`
              return renderLoop(child, `${pathKey}/${childKey}`)
            })}
          </div>
        )}
      </div>
    )
  }

  const handleBpmChange = newBpm => {
    mediaPlayerRef.current.setBpm(newBpm)
  }

  const handleBeatsPerMeasureChange = newBeatsPerMeasure => {
    mediaPlayerRef.current.setBeatsPerMeasure(newBeatsPerMeasure)
  }

  const handleMeasuresChange = newMeasures => {
    const next = { ...appSettings, measures: newMeasures }
    setAppSettingsState(next)
    setAppSetting('measures', newMeasures).catch(() => {})
  }

  if (!mediaPlayerRef.current || appSettingsLoading) return <p>loading...</p>

  return (
    <TooltipProvider>
      <div className='h-full w-full flex flex-col'>
        <div className='h-[5vh] px-4 flex flex-none items-center justify-between'>
          <div className='max-w-[80%] truncate text-sm font-medium'>
            {playerMetadata.name}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='xs'
                disabled={controlsDisabled}
                onClick={handleCloseVideo}
                aria-label='Close'
              >
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </div>

        <div className='h-full w-full px-2 overflow-y-auto snap-y snap-mandatory grid lg:grid-cols-[2fr_1fr] lg:snap-none'>
          <section className='snap-start lg:snap-none p-2 gap-2'>
            {/* Card 1: player + transport + playback rate */}
            <Card className='flex flex-col h-full gap-4 p-4'>
              {mediaPlayerRef.current &&
                mediaPlayerRef.current.renderComponent()}

              {/* Track sliders (loop + playback position) */}
              {/* Timestamps */}
              <div className='flex w-full justify-between text-xs text-muted-foreground'>
                <span>{timestampFormatter(currentTime)}</span>
                <span>{timestampFormatter(duration)}</span>
              </div>
              <div className='w-full'>
                <div className='relative w-full'>
                  {/* loop region highlight behind sliders */}
                  {duration > 0 && loopEnd > loopStart && (
                    <div
                      className='pointer-events-none absolute top-1/2 -translate-y-1/2 h-5 bg-muted-foreground/20 z-0'
                      style={{
                        left: `${(Math.max(0, loopStart) / duration) * 100}%`,
                        width: `${
                          ((Math.min(duration, loopEnd) -
                            Math.max(0, loopStart)) /
                            duration) *
                          100
                        }%`,
                      }}
                    />
                  )}

                  {/* loop range thumbs (transparent track, on top of highlight) */}
                  <div className='absolute inset-0 flex items-center z-10'>
                    <Slider
                      min={0}
                      max={duration}
                      step={0.1}
                      value={[loopStart, loopEnd]}
                      onValueChange={handleIntervalChange}
                      className='relative'
                      thumbClassNames={[
                        'relative rounded-none border-0 border-l-2 border-l-emerald-500 before:absolute before:-bottom-8 before:h-7 before:w-5 before:rounded-full before:bg-emerald-500',
                        'relative before:-translate-x-full rounded-none border-0 border-r-2 border-r-red-500 before:absolute before:-bottom-8 before:h-7 before:w-5 before:rounded-full before:bg-red-500',
                      ]}
                    />
                  </div>

                  {/* playback position (thin bar + thumb, above everything) */}
                  <Slider
                    min={0}
                    max={duration}
                    step={0.1}
                    value={[isScrubbing ? scrubTime : currentTime]}
                    onValueChange={val => {
                      setIsScrubbing(true)
                      setScrubTime(val[0])
                    }}
                    onValueCommit={val => {
                      setIsScrubbing(false)
                      handleSeek(val[0])
                    }}
                    className='relative z-20'
                  />
                </div>
              </div>

              {/* Primary transport controls */}
              <div className='mt-8 flex flex-col items-center gap-6'>
                <div className='flex flex-col sm:flex-row w-full items-center justify-center gap-6'>
                  <div className='flex gap-5 sm:gap-3 items-center'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-10 w-10 rounded-md sm:h-10 sm:w-10'
                          onClick={restartPlayer}
                        >
                          <SkipBack />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Restart player</TooltipContent>
                    </Tooltip>

                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='h-14 w-14 rounded-full'
                      onClick={isPlaying ? handlePause : handlePlay}
                      disabled={controlsDisabled}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className='h-7 w-7' />
                      ) : (
                        <Play className='h-7 w-7' />
                      )}
                    </Button>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-10 w-10 rounded-md sm:h-10 sm:w-10'
                          onClick={restartLoop}
                        >
                          <RotateCcw />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Jump to loop start</TooltipContent>
                    </Tooltip>
                  </div>

                  <Separator
                    className='hidden sm:block'
                    orientation='vertical'
                  />

                  <div className='flex gap-5 sm:gap-3 items-center'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-10 w-10 rounded-md'
                          onClick={markLoopStart}
                        >
                          <Flag className='text-emerald-500' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Mark loop start</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-10 w-10 rounded-md'
                          onClick={saveLoop}
                        >
                          <Save />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Save loop</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-10 w-10 rounded-md'
                          onClick={markLoopEnd}
                        >
                          <Flag className='text-red-500' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Mark loop end</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Playback rate slider, centered under buttons */}
                <div className='flex w-full justify-center'>
                  <div className='flex items-center gap-2 w-full max-w-[12rem]'>
                    <div className='text-xs text-muted-foreground'>
                      {playbackRate?.toFixed(2)}x
                    </div>
                    <Slider
                      min={0.125}
                      max={2}
                      step={0.125}
                      value={[playbackRate]}
                      onValueChange={val => handlePlaybackRateChange(val[0])}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <section className='snap-start lg:snap-none p-2 grid grid-rows-4 gap-2'>
            <Card className='flex flex-col gap-2 p-4'>
              <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-3'>
                  <div className='flex-1'>
                    <TimeTextInput
                      onChange={value => setLoopStart(value)}
                      changeAmount={0.1}
                      disabled={controlsDisabled}
                      label='start'
                      min={0}
                      max={duration}
                      value={loopStart}
                    />
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='flex-1'>
                    <TimeTextInput
                      value={currentTime}
                      disabled={controlsDisabled}
                      onChange={value => {
                        setCurrentTime(value)
                        mediaPlayerRef.current?.seekTo(value)
                      }}
                      label='current'
                      changeAmount={0.1}
                      min={0}
                      max={duration}
                    />
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='flex-1'>
                    <TimeTextInput
                      value={loopEnd}
                      disabled={controlsDisabled}
                      onChange={value => setLoopEnd(value)}
                      changeAmount={0.1}
                      label='end'
                      min={0}
                      max={duration}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className='h-min flex flex-col gap-4 p-4'>
              {!isRhythmLocked ? (
                <BPMInput
                  value={playerMetadata.bpm}
                  onChange={handleBpmChange}
                  beatsPerMeasure={playerMetadata.beatsPerMeasure}
                  onBeatsPerMeasureChange={handleBeatsPerMeasureChange}
                  onSubmit={() => {
                    if (
                      !playerMetadata.bpm ||
                      !playerMetadata.beatsPerMeasure
                    ) {
                      showToast(
                        'provide both BPM and beats/measure to use this function',
                      )
                      return
                    }
                    setIsRhythmLocked(true)
                  }}
                />
              ) : (
                <>
                  <div className='flex items-center gap-3 md:items-end'>
                    <div className='flex flex-col justify-end gap-1 text-xs text-muted-foreground'>
                      <div className='font-medium'>Rhythm locked</div>
                      <div>
                        BPM: {playerMetadata.bpm ?? '—'} • beats/measure:{' '}
                        {playerMetadata.beatsPerMeasure ?? '—'}
                      </div>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => setIsRhythmLocked(false)}
                          aria-label='Edit BPM and beats/measure'
                        >
                          <Pencil />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Edit BPM &amp; beats/measure
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className='flex gap-3 items-end sm:gap-4'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='lg'
                          onClick={() => {
                            if (
                              !playerMetadata.bpm ||
                              !playerMetadata.beatsPerMeasure
                            ) {
                              showToast(
                                'provide both BPM and beats/measure to use this function',
                              )
                              return
                            }
                            const newStart = Math.round(
                              loopStart -
                                (measures * playerMetadata.beatsPerMeasure) /
                                  (playerMetadata.bpm / 60),
                            )
                            setLoopEnd(loopStart)
                            setLoopStart(newStart)
                          }}
                        >
                          <ArrowBigLeftDash />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{`Previous ${measures} measures`}</TooltipContent>
                    </Tooltip>

                    <div className='w-full'>
                      <div className='mb-1 text-xs font-medium text-muted-foreground'>
                        measures
                      </div>
                      <ScrubbableNumberInput
                        value={measures}
                        onChange={val =>
                          handleMeasuresChange(parseInt(val, 10) || 0)
                        }
                        step={1}
                        min={1}
                      />
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='lg'
                          onClick={() => {
                            if (
                              !playerMetadata.bpm ||
                              !playerMetadata.beatsPerMeasure
                            ) {
                              showToast(
                                'provide both BPM and beats/measure to use this function',
                              )
                              return
                            }
                            const newEnd = Math.round(
                              loopEnd +
                                (measures * playerMetadata.beatsPerMeasure) /
                                  (playerMetadata.bpm / 60),
                            )
                            setLoopStart(loopEnd)
                            setLoopEnd(newEnd)
                          }}
                        >
                          <ArrowBigRightDash />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{`Next ${measures} measures`}</TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}
            </Card>

            <Card className='flex h-full flex-col overflow-hidden p-2 pb-6 row-span-2'>
              {playerMetadata.loops &&
              Object.keys(playerMetadata.loops).length > 0 ? (
                <div className='flex flex-col'>
                  {Object.values(playerMetadata.loops)
                    .sort((a, b) => a.loopStart - b.loopStart)
                    .map(loop => {
                      const key = `${loop.loopStart}-${loop.loopEnd}`
                      return renderLoop(loop, key)
                    })}
                </div>
              ) : (
                <div className='p-3 text-sm text-muted-foreground'>
                  Save a loop to see it here
                </div>
              )}
            </Card>
          </section>
        </div>
      </div>
    </TooltipProvider>
  )
}
