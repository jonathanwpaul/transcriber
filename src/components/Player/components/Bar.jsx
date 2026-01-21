import { useEffect, useState } from 'react'
import { Flag, Pause, Play, RotateCcw, Save, SkipBack } from 'lucide-react'

import { Button } from '@components/ui/button'
import { Slider } from '@components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'

export const Bar = ({
  currentTime,
  duration,
  handleSeek,
  handleIntervalChange,
  loopStart,
  loopEnd,
  timestampFormatter,
  isPlaying,
  onPlay,
  onPause,
  restartPlayer,
  playbackRate,
  handlePlaybackRateChange,
  markLoopStart,
  markLoopEnd,
  saveLoop,
  restartLoop,
  controlsDisabled,
}) => {
  // Local scrubbing state for the playback position slider so dragging feels
  // smooth and isn't fighting with currentTime updates from the player.
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [scrubTime, setScrubTime] = useState(currentTime)

  // Keep the scrub value in sync with the actual currentTime whenever the user
  // is not actively dragging the slider.
  useEffect(() => {
    if (!isScrubbing) {
      setScrubTime(currentTime)
    }
  }, [currentTime, isScrubbing])

  return (
    <div className='w-full flex flex-col gap-2'>
      <div className='flex flex-wrap items-center gap-6'>
        <div className='flex flex-col md:flex-row md:justify-end md:items-center w-full items-end gap-3'>
          <div className='order-2 flex items-center gap-5'>
            <div className='flex gap-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='h-12 w-12 rounded-md sm:h-10 sm:w-10'
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
                    className='h-12 w-12 rounded-md sm:h-10 sm:w-10'
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
                    className='h-12 w-12 rounded-md sm:h-10 sm:w-10'
                    onClick={saveLoop}
                  >
                    <Save />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save loop</TooltipContent>
              </Tooltip>
            </div>

            <div className='w-[2px] bg-muted self-stretch' />

            <div className='flex items-center gap-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='h-12 w-12 rounded-md sm:h-10 sm:w-10'
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
                className='h-12 w-12 rounded-full'
                onClick={isPlaying ? onPause : onPlay}
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
                    className='h-12 w-12 rounded-md sm:h-10 sm:w-10'
                    onClick={restartLoop}
                  >
                    <RotateCcw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Jump to loop start</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Playback rate slider (second on all layouts) */}
          <div className='order-1 flex items-center gap-2 w-full max-w-[12rem]'>
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

        {/* Track sliders (loop + playback position) */}
        <div className='order-3 basis-full w-full'>
          <div className='relative w-full'>
            {/* loop region highlight behind sliders */}
            {duration > 0 && loopEnd > loopStart && (
              <div
                className='pointer-events-none absolute top-1/2 -translate-y-1/2 h-5 rounded-full bg-muted z-0'
                style={{
                  left: `${(Math.max(0, loopStart) / duration) * 100}%`,
                  width: `${
                    ((Math.min(duration, loopEnd) - Math.max(0, loopStart)) /
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
                className='relative opacity-80'
                rangeClassName='bg-muted'
                thumbClassNames={[
                  // Start thumb: rectangle extending to the left, with its
                  // right edge (and right border) aligned exactly on the
                  // track position.
                  'relative rounded-none border-r-2 border-r-emerald-500 border-l-0 -translate-x-1/2 h-8 w-[10px] sm:h-8 sm:w-[8px] before:block before:absolute before:-bottom-6 before:-left-2 before:h-8 before:w-3 before:rounded-full before:bg-emerald-500 sm:before:hidden',
                  // End thumb: rectangle extending to the right, with its
                  // left edge (and left border) aligned exactly on the
                  // track position.
                  'relative rounded-none border-l-2 border-l-red-500 border-r-0 translate-x-1/2 h-8 w-[10px] sm:h-8 sm:w-[8px] before:block before:absolute before:-bottom-6 before:-right-2 before:h-8 before:w-3 before:rounded-full before:bg-red-500 sm:before:hidden',
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

        {/* Timestamps (always last on small screens) */}
        <div className='order-4 flex w-full justify-between text-xs text-muted-foreground'>
          <span>{timestampFormatter(currentTime)}</span>
          <span>{timestampFormatter(duration)}</span>
        </div>
      </div>
    </div>
  )
}
