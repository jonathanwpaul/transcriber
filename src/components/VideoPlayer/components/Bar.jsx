import { Flag, Pause, Play, RotateCcw, Save, SkipBack } from 'lucide-react'

import { Button } from '@components/ui/button'
import { Slider } from '@components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'

export const Bar = ({
  currentTime,
  duration,
  handleSeek,
  handleIntervalChange,
  sectionStart,
  sectionEnd,
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
  return (
    <div className='flex flex-col gap-2'>
      {/* On mobile, stack controls and bar; on larger screens, keep them in a row */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:gap-4'>
        {/* Playback controls */}
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

          <div className='flex flex-[1_0_0] items-center gap-2'>
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

        {/* Timeline / loop bar */}
        <div className='w-full md:flex-1 md:min-w-[200px]'>
          <div className='flex items-center gap-3'>
            <div className='w-16 shrink-0 text-xs text-muted-foreground'>
              {timestampFormatter(currentTime)}
            </div>

            <div className='relative flex-1'>
              {/* loop range */}
              <div className='absolute inset-0 flex items-center'>
                <Slider
                  min={0}
                  max={duration}
                  step={0.1}
                  value={[sectionStart, sectionEnd]}
                  onValueChange={handleIntervalChange}
                  className='opacity-80'
                />
              </div>

              {/* playback position */}
              <Slider
                min={0}
                max={duration}
                step={0.1}
                value={[currentTime]}
                onValueChange={val => handleSeek(val[0])}
              />
            </div>

            <div className='w-16 shrink-0 text-right text-xs text-muted-foreground'>
              {timestampFormatter(duration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
