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
      <div className='flex flex-wrap items-center gap-3'>
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
