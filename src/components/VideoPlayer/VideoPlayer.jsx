import _ from 'lodash'
import { useState, useRef, useCallback } from 'react'
import {
  Flag,
  Pause,
  Play,
  RotateCcw,
  Save,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react'

import { usePreferenceValue } from '@hooks/usePreferenceValue'
import { timestampFormatter, round } from '@utils/video'
import { videoSources } from '@utils/constants'

import { Bar } from './components/Bar'
import BPMInput from './components/BPMInput'
import { LocalFileSource } from './components/LocalFileSource'
import SavedSection from './components/SavedSection'
import { TimeTextInput } from './components'
import { YouTubeSource } from './components/YouTubeSource'

import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'
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
  const videos = JSON.parse(videosString) || {}

  const { beatsPerMeasure, bpm, type: sourceType } = videos[id] || {}

  const playerRef = useRef()
  const timerRef = useRef()
  const sectionStartRef = useRef()
  const sectionEndRef = useRef()
  sectionStartRef.current = sectionStart
  sectionEndRef.current = sectionEnd

  // disable controls until the underlying player has mounted
  const controlsDisabled = !playerRef.current

  const timeIncrement = useCallback(() => {
    setCurrentTime(round(playerRef.current?.getCurrentTime()))
    if (playerRef.current?.getCurrentTime() > sectionEndRef.current) {
      handleSeek(sectionStartRef.current)
    }
  }, [])

  const handlePlay = () => {
    if (!playerRef.current) return
    setIsPlaying(true)
    timerRef.current = setInterval(
      timeIncrement,
      100, //every 0.1s
    )
    playerRef.current.play()
  }

  const handlePause = () => {
    clearInterval(timerRef.current)
    setIsPlaying(false)
    playerRef.current?.pause()
  }

  /**
   * moves the slider to the start
   */
  const restartPlayer = () => {
    handleSeek(0)
  }

  const handleSeek = newValue => {
    if (!playerRef.current) return
    clearInterval(timerRef.current)
    setCurrentTime(round(newValue))
    playerRef.current.seekTo(round(newValue))
  }

  const handlePlaybackRateChange = newValue => {
    if (!playerRef.current) return
    setPlaybackRate(newValue)
    playerRef.current.setPlaybackRate(newValue)
  }

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

    setSectionStart(round(newStart))
    setSectionEnd(round(newEnd))

    // keep playhead within loop
    if (currentTime < newStart) handleSeek(newStart)
    if (currentTime > newEnd) handleSeek(newEnd)
  }

  const handleCloseVideo = () => {
    playerRef.current = null
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
    const key = `${sectionStart}-${sectionEnd}`
    videos[id].loops = videos[id].loops || {}

    //find the path that this loop belongs into (nesting)
    const path = calculatePath(videos[id].loops, {
      sectionStart,
      sectionEnd,
    })

    _.set(videos[id].loops, path.split('/'), {
      ...(videos[id].loops[key] || {}), //for any other fields we want to save with loops
      sectionStart,
      sectionEnd,
    })
    setVideos('videos', videos)
  }

  const deleteLoop = loop => {
    videos[id].loops = _.omit(
      videos[id].loops,
      `${loop.sectionStart}-${loop.sectionEnd}`,
    )
    console.log(videos[id])
    setVideos('videos', videos)
  }

  const loadLoop = loop => {
    setSectionStart(loop['sectionStart'])
    setSectionEnd(loop['sectionEnd'])
    setCurrentTime(loop['sectionStart'])
    playerRef.current.seekTo(loop['sectionStart'])

    //TODO: make appsetting for playing on load of loop
    playerRef.current?.play()
  }
  const markLoopStart = () => {
    setSectionStart(round(currentTime))
  }

  const markLoopEnd = () => {
    setSectionEnd(round(currentTime))
  }

  const restartLoop = () => {
    if (!playerRef.current) return
    setCurrentTime(sectionStart)
    playerRef.current.seekTo(sectionStart)
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
            loop.title = title
            setVideos('videos', videos)
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
    videos[id].bpm = newBpm
    setVideos('videos', videos)
  }

  const handleBeatsPerMeasureChange = newBeatsPerMeasure => {
    videos[id].beatsPerMeasure = newBeatsPerMeasure
    setVideos('videos', videos)
  }

  const handleMeasuresChange = newMeasures => {
    setAppSettings('appSettings', { ...appSettings, measures: newMeasures })
  }

  if (loading || appSettingsLoading) return

  return (
    <TooltipProvider>
      <div className='relative flex h-full w-full flex-col'>
        <div className='absolute left-3 top-3 z-10'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
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

        <div className='flex-1 overflow-auto p-4'>
          <div className='mx-auto flex w-full max-w-6xl flex-col gap-4'>
            <div className='grid gap-4 lg:grid-cols-[1fr_2fr]'>
              <Card className='h-fit max-h-[45vh] overflow-auto p-2'>
                {videos[id].loops &&
                Object.keys(videos[id].loops).length > 0 ? (
                  <div className='flex flex-col'>
                    {Object.values(videos[id].loops)
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

              <div className='flex flex-col gap-4'>
                <Card className='p-4'>
                  <div className='flex flex-col gap-4 lg:flex-row'>
                    <div className='w-full lg:flex-1'>
                      {sourceType === videoSources.FILE ? (
                        <LocalFileSource
                          id={id}
                          onPause={handlePause}
                          onPlay={handlePlay}
                          playerRef={playerRef}
                          setCurrentTime={setCurrentTime}
                          setDuration={setDuration}
                          setIsPlaying={setIsPlaying}
                          setPlaybackRate={setPlaybackRate}
                          setSectionEnd={setSectionEnd}
                          setSectionStart={setSectionStart}
                          setVideos={setVideos}
                          showToast={showToast}
                          videos={videos}
                        />
                      ) : (
                        <YouTubeSource
                          id={id}
                          onPause={handlePause}
                          onPlay={handlePlay}
                          playerRef={playerRef}
                          setCurrentTime={setCurrentTime}
                          setDuration={setDuration}
                          setIsPlaying={setIsPlaying}
                          setPlaybackRate={setPlaybackRate}
                          setSectionEnd={setSectionEnd}
                          setSectionStart={setSectionStart}
                          setVideos={setVideos}
                          videos={videos}
                        />
                      )}
                    </div>

                    <div className='grid w-full gap-3 lg:w-64'>
                      <TimeTextInput
                        onChange={value => setSectionStart(value)}
                        changeAmount={0.5}
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
                          playerRef.current.seekTo(value)
                        }}
                        label='current'
                        changeAmount={0.5}
                        min={0}
                        max={duration}
                      />
                      <TimeTextInput
                        value={sectionEnd}
                        disabled={controlsDisabled}
                        onChange={value => setSectionEnd(value)}
                        changeAmount={0.5}
                        label='end'
                        min={0}
                        max={duration}
                      />
                    </div>
                  </div>
                </Card>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <Card className='p-4'>
                    <BPMInput
                      value={bpm}
                      onChange={handleBpmChange}
                      beatsPerMeasure={beatsPerMeasure || 4}
                      onBeatsPerMeasureChange={handleBeatsPerMeasureChange}
                    />
                  </Card>

                  <Card className='p-4'>
                    <div className='flex flex-col items-center gap-3'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => {
                              if (!bpm || !beatsPerMeasure) {
                                showToast(
                                  'provide both BPM and beats/measure to use this function',
                                )
                                return
                              }
                              const newStart = Math.round(
                                sectionStart -
                                  (measures * beatsPerMeasure) / (bpm / 60),
                              )
                              setSectionEnd(sectionStart)
                              setSectionStart(newStart)
                            }}
                          >
                            <SkipBack />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{`Previous ${measures} measures`}</TooltipContent>
                      </Tooltip>

                      <div className='w-full'>
                        <div className='mb-1 text-xs font-medium text-muted-foreground'>
                          measures
                        </div>
                        <Input
                          type='number'
                          value={measures}
                          onChange={e =>
                            handleMeasuresChange(parseInt(e.target.value, 10))
                          }
                        />
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => {
                              if (!bpm || !beatsPerMeasure) {
                                showToast(
                                  'provide both BPM and beats/measure to use this function',
                                )
                                return
                              }
                              const newEnd = Math.round(
                                sectionEnd +
                                  (measures * beatsPerMeasure) / (bpm / 60),
                              )
                              setSectionStart(sectionEnd)
                              setSectionEnd(newEnd)
                            }}
                          >
                            <SkipForward />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{`Next ${measures} measures`}</TooltipContent>
                      </Tooltip>
                    </div>
                  </Card>
                </div>

                <Card className='p-4'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          onClick={restartPlayer}
                        >
                          <SkipBack />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Restart player</TooltipContent>
                    </Tooltip>

                    <Button
                      type='button'
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

                    <div className='flex items-center gap-2'>
                      <div className='text-xs text-muted-foreground'>
                        {playbackRate.toFixed(2)}x
                      </div>
                      <Slider
                        orientation='vertical'
                        min={0.125}
                        max={2}
                        step={0.125}
                        value={[playbackRate]}
                        onValueChange={val => handlePlaybackRateChange(val[0])}
                      />
                    </div>

                    <div className='flex flex-wrap gap-2'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
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
                            onClick={markLoopEnd}
                          >
                            <Flag className='text-red-500' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark loop end</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type='button'
                            variant='secondary'
                            size='icon'
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
                            onClick={restartLoop}
                          >
                            <RotateCcw />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Jump to loop start</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className='border-t bg-card p-4'>
          <div className='mx-auto w-full max-w-6xl'>
            <Bar
              title={videos[id].title}
              currentTime={currentTime}
              duration={duration}
              handleSeek={handleSeek}
              handleIntervalChange={handleIntervalChange}
              sectionStart={sectionStart}
              sectionEnd={sectionEnd}
              timestampFormatter={timestampFormatter}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
