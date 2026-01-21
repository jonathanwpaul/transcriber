import _ from 'lodash'
import { useState, useRef, useEffect, useMemo } from 'react'
import { ArrowBigLeftDash, ArrowBigRightDash, Pencil, X } from 'lucide-react'

import { usePreferenceValue } from '@hooks/usePreferenceValue'
import { timestampFormatter, round } from '@utils/video'
import { videoSources } from '@utils/constants'
import { YouTubePlayer, LocalFilePlayer } from '../../lib/media'

import {
  Bar,
  BPMInput,
  TimeTextInput,
  SavedSection,
  ScrubbableNumberInput,
} from './components'

import { Button, Card } from '../ui'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

export const VideoPlayer = ({ id, setShowVideoPlayer, showToast, type }) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [sectionStart, setSectionStart] = useState(0)
  const [sectionEnd, setSectionEnd] = useState(0)

  // collapse state for loop tree nodes, keyed by a stable path string
  const [collapsedLoops, setCollapsedLoops] = useState({})
  // metadata emitted by the MediaPlayer (BPM, beats/measure, loops, etc.)
  const [playerMetadata, setPlayerMetadata] = useState(null)

  const {
    preference: videosString,
    loading,
    setValue: setVideos,
  } = usePreferenceValue({
    key: 'videos',
  })

  const {
    preference: appSettingsString,
    loading: appSettingsLoading,
    setValue: setAppSettings,
  } = usePreferenceValue({
    key: 'appSettings',
  })

  const appSettings = JSON.parse(appSettingsString) || {
    measures: 4,
    useSelectedAsParent: true,
  }
  const measures = appSettings['measures']

  const videos = useMemo(
    () => JSON.parse(videosString) || {},
    [videosString],
  )

  const videoEntry = useMemo(
    () => videos[id] || {},
    [videos, id],
  )

  const rawBpm = playerMetadata?.bpm ?? videoEntry.bpm
  const rawBeatsPerMeasure =
    playerMetadata?.beatsPerMeasure ?? videoEntry.beatsPerMeasure

  // Effective rhythm values with sensible defaults
  const effectiveBeatsPerMeasure =
    typeof rawBeatsPerMeasure === 'number' ? rawBeatsPerMeasure : 4
  const effectiveBpm = typeof rawBpm === 'number' && rawBpm > 0 ? rawBpm : null

  const loops = playerMetadata?.loops || videoEntry.loops || {}

  // UI-only state: whether we're showing traversal controls vs BPM editor
  const [isRhythmLocked, setIsRhythmLocked] = useState(null)

  const mediaPlayerRef = useRef(null)
  const sectionStartRef = useRef()
  const sectionEndRef = useRef()
  sectionStartRef.current = sectionStart
  sectionEndRef.current = sectionEnd

  // disable controls until the underlying player has mounted
  const controlsDisabled = !mediaPlayerRef.current

  const handlePlay = () => {
    if (!mediaPlayerRef.current) return
    mediaPlayerRef.current.play()
  }

  const handlePause = () => {
    if (!mediaPlayerRef.current) return
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
    if (!id || !videoEntry) {
      if (mediaPlayerRef.current) {
        mediaPlayerRef.current.destroy?.()
        mediaPlayerRef.current = null
      }
      return
    }

    const typeForPlayer = videoEntry.type
    const source = {
      sourceUrl: videoEntry.sourceUrl ?? null,
      mimeType: videoEntry.mimeType ?? null,
      filePath: videoEntry.filePath ?? null,
      fileDirectory: videoEntry.fileDirectory ?? null,
    }

    let PlayerClass = null
    if (typeForPlayer === videoSources.YOUTUBE) {
      PlayerClass = YouTubePlayer
    } else if (typeForPlayer === videoSources.FILE) {
      PlayerClass = LocalFilePlayer
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
      onReady: ({ duration: d, currentTime: ct, playbackRate: pr }) => {
        setDuration(d)
        setCurrentTime(ct)
        setPlaybackRate(pr)
        // For now, default loop to full duration on ready.
        setSectionStart(0)
        setSectionEnd(d)
      },
      onDuration: d => setDuration(d),
      onTimeUpdate: t => {
        const rounded = round(t)
        setCurrentTime(rounded)
        if (t > sectionEndRef.current) {
          handleSeek(sectionStartRef.current)
        }
      },
      onPlaybackRateChange: r => setPlaybackRate(r),
      onPlayingChange: playing => setIsPlaying(playing),
      onMetadataChange: meta => setPlayerMetadata(meta),
    }

    const player = new PlayerClass({
      id,
      source,
      callbacks,
    })

    mediaPlayerRef.current = player

    return () => {
      player.destroy?.()
      if (mediaPlayerRef.current === player) {
        mediaPlayerRef.current = null
      }
    }
  }, [id, videoEntry])

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

    setSectionStart(roundedStart)
    setSectionEnd(roundedEnd)

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
    setShowVideoPlayer(false)
  }

  /**
   * this calculates the path of a given loop using the start and end times.
   */
  const calculatePath = (loops, loop, path = '') => {
    const getLoopDistance = k =>
      loop.sectionStart -
      loops[k].sectionStart +
      loops[k].sectionEnd -
      loop.sectionEnd
    const parentKeys = Object.keys(loops)
      .filter(
        k =>
          loops[k].sectionStart <= loop.sectionStart &&
          loops[k].sectionEnd >= loop.sectionEnd,
      )
      .sort((a, b) => getLoopDistance(a) - getLoopDistance(b))

    if (parentKeys.length === 0) {
      return path + `${loop.sectionStart}-${loop.sectionEnd}`
    }
    return calculatePath(
      loops[parentKeys[0]]?.children || {},
      loop,
      path + parentKeys[0] + '/children/',
    )
  }

  const saveLoop = () => {
    if (!mediaPlayerRef.current) return
    const key = `${sectionStart}-${sectionEnd}`
    const currentLoops = loops || {}
    const nextLoops = _.cloneDeep(currentLoops)

    //find the path that this loop belongs into (nesting)
    const path = calculatePath(nextLoops, {
      sectionStart,
      sectionEnd,
    })

    const existing = _.get(nextLoops, path, {})

    _.set(nextLoops, path.split('/'), {
      ...existing, // for any other fields we want to save with loops
      sectionStart,
      sectionEnd,
    })

    mediaPlayerRef.current.setLoops(nextLoops).catch(() => {})
    if (mediaPlayerRef.current.setLastLoopSelected) {
      mediaPlayerRef.current.setLastLoopSelected(key).catch(() => {})
    }
  }

  const deleteLoop = loop => {
    if (!mediaPlayerRef.current) return
    const currentLoops = loops || {}
    const nextLoops = _.omit(
      currentLoops,
      `${loop.sectionStart}-${loop.sectionEnd}`,
    )
    mediaPlayerRef.current.setLoops(nextLoops).catch(() => {})
  }

  const loadLoop = loop => {
    const start = loop['sectionStart']
    const end = loop['sectionEnd']
    setSectionStart(start)
    setSectionEnd(end)
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
    setSectionStart(newStart)
    if (mediaPlayerRef.current?.setLastSectionPositions) {
      mediaPlayerRef.current
        .setLastSectionPositions(newStart, sectionEnd)
        .catch(() => {})
    }
  }

  const markLoopEnd = () => {
    const newEnd = round(currentTime)
    setSectionEnd(newEnd)
    if (mediaPlayerRef.current?.setLastSectionPositions) {
      mediaPlayerRef.current
        .setLastSectionPositions(sectionStart, newEnd)
        .catch(() => {})
    }
  }

  const restartLoop = () => {
    if (!mediaPlayerRef.current) return
    setCurrentTime(sectionStart)
    mediaPlayerRef.current.seekTo(sectionStart)
  }

  const renderLoop = (loop, pathKey) => {
    const hasChildren = !!(
      loop.children && Object.keys(loop.children).length > 0
    )
    const isCollapsed = !!collapsedLoops[pathKey]

    return (
      <div key={pathKey} className='flex flex-col gap-2'>
        <SavedSection
          endTime={loop.sectionEnd}
          isSelected={
            loop.sectionStart === sectionStart && loop.sectionEnd === sectionEnd
          }
          onClick={() => loadLoop(loop)}
          onDelete={() => deleteLoop(loop)}
          onTitleChange={title => {
            if (!mediaPlayerRef.current) return
            const currentLoops = loops || {}
            const nextLoops = _.cloneDeep(currentLoops)
            // pathKey uses sectionStart-sectionEnd chain; use it directly to locate this loop
            const segments = pathKey.split('/')
            const existingLoop = _.get(nextLoops, segments, {})
            _.set(nextLoops, segments, {
              ...existingLoop,
              title,
            })
            mediaPlayerRef.current.setLoops(nextLoops).catch(() => {})
          }}
          startTime={loop.sectionStart}
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
              const childKey = `${child.sectionStart}-${child.sectionEnd}`
              return renderLoop(child, `${pathKey}/${childKey}`)
            })}
          </div>
        )}
      </div>
    )
  }

  const handleBpmChange = newBpm => {
    if (!mediaPlayerRef.current?.setBpm) return
    mediaPlayerRef.current.setBpm(newBpm).catch(() => {})
  }

  const handleBeatsPerMeasureChange = newBeatsPerMeasure => {
    if (!mediaPlayerRef.current?.setBeatsPerMeasure) return
    mediaPlayerRef.current
      .setBeatsPerMeasure(newBeatsPerMeasure)
      .catch(() => {})
  }

  const handleMeasuresChange = newMeasures => {
    setAppSettings('appSettings', { ...appSettings, measures: newMeasures })
  }

  // Persist default beatsPerMeasure (4) into the song entry if missing so it's
  // treated like a real saved value. This is now handled via MediaPlayer
  // metadata; we keep this effect as a no-op placeholder for backward
  // compatibility and potential cleanup.
  useEffect(() => {
    // intentionally left blank
  }, [id, videosString, setVideos])

  // Initialize rhythm lock from saved BPM / beats if present. Only run this
  // once (when state is still null) so user toggles are respected.
  useEffect(() => {
    if (isRhythmLocked === null) {
      setIsRhythmLocked(!!(effectiveBpm && effectiveBeatsPerMeasure))
    }
  }, [effectiveBpm, effectiveBeatsPerMeasure, isRhythmLocked])

  if (loading || appSettingsLoading) return

  return (
    <TooltipProvider>
      <div className='flex h-full w-full flex-col'>
        <div className='flex h-[5vh] flex-none items-center justify-between border-b bg-card px-4'>
          <div className='max-w-[80%] truncate text-sm font-medium'>
            {playerMetadata?.title || videoEntry.title || 'Now Playing'}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
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

        <div className='mx-auto flex overflow-y-auto snap-y snap-mandatory h-full w-full max-w-6xl flex-col gap-4 lg:grid lg:grid-cols-[2fr_1fr] lg:p-4'>
          <section className='flex flex-col p-2 md:p-0 gap-4 min-h-full snap-start lg:snap-none'>
            <Card className='flex h-full flex-col gap-6 p-4'>
              {mediaPlayerRef.current &&
                mediaPlayerRef.current.renderComponent()}

              <div className='flex-1 grid gap-3 sm:grid-cols-3'>
                <TimeTextInput
                  onChange={value => setSectionStart(value)}
                  changeAmount={0.1}
                  disabled={controlsDisabled}
                  label='start'
                  min={0}
                  max={duration}
                  value={sectionStart}
                />
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
                <TimeTextInput
                  value={sectionEnd}
                  disabled={controlsDisabled}
                  onChange={value => setSectionEnd(value)}
                  changeAmount={0.1}
                  label='end'
                  min={0}
                  max={duration}
                />
              </div>

              <div className='flex-1 grid gap-4 items-start md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]'>
                {!(isRhythmLocked ?? false) ? (
                  <BPMInput
                    value={effectiveBpm ?? ''}
                    onChange={handleBpmChange}
                    beatsPerMeasure={effectiveBeatsPerMeasure}
                    onBeatsPerMeasureChange={handleBeatsPerMeasureChange}
                    onSubmit={() => {
                      if (!effectiveBpm || !effectiveBeatsPerMeasure) {
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
                          BPM: {effectiveBpm ?? '—'} • beats/measure:{' '}
                          {effectiveBeatsPerMeasure ?? '—'}
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

                    <div className='flex items-end gap-3 lg:items-end'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type='button'
                            variant='outline'
                            size='lg'
                            onClick={() => {
                              if (!effectiveBpm || !effectiveBeatsPerMeasure) {
                                showToast(
                                  'provide both BPM and beats/measure to use this function',
                                )
                                return
                              }
                              const newStart = Math.round(
                                sectionStart -
                                  (measures * effectiveBeatsPerMeasure) /
                                    (effectiveBpm / 60),
                              )
                              setSectionEnd(sectionStart)
                              setSectionStart(newStart)
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
                              if (!effectiveBpm || !effectiveBeatsPerMeasure) {
                                showToast(
                                  'provide both BPM and beats/measure to use this function',
                                )
                                return
                              }
                              const newEnd = Math.round(
                                sectionEnd +
                                  (measures * effectiveBeatsPerMeasure) /
                                    (effectiveBpm / 60),
                              )
                              setSectionStart(sectionEnd)
                              setSectionEnd(newEnd)
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
              </div>
            </Card>
          </section>

          <section className='flex flex-col p-2 md:p-0 gap-4 min-h-full snap-start lg:snap-none'>
            <Card className='flex h-full flex-col overflow-hidden p-2 pb-6'>
              {videoEntry.loops && Object.keys(videoEntry.loops).length > 0 ? (
                <div className='flex flex-col'>
                  {Object.values(videoEntry.loops)
                    .sort((a, b) => a.sectionStart - b.sectionStart)
                    .map(loop => {
                      const key = `${loop.sectionStart}-${loop.sectionEnd}`
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

        <div className='flex flex-none h-[20vh] md:h-unset items-center w-full border-t bg-card px-4 py-2'>
          <Bar
            title={videoEntry.title}
            currentTime={currentTime}
            duration={duration}
            handleSeek={handleSeek}
            handleIntervalChange={handleIntervalChange}
            sectionStart={sectionStart}
            sectionEnd={sectionEnd}
            timestampFormatter={timestampFormatter}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            restartPlayer={restartPlayer}
            playbackRate={playbackRate}
            handlePlaybackRateChange={handlePlaybackRateChange}
            markLoopStart={markLoopStart}
            markLoopEnd={markLoopEnd}
            saveLoop={saveLoop}
            restartLoop={restartLoop}
            controlsDisabled={controlsDisabled}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
