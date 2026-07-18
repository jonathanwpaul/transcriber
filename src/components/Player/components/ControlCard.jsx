import { Pause, Play, RotateCcw, SkipBack } from 'lucide-react'
import { timestampFormatter } from '@utils/video'
import { Button, Card, Slider } from '@components/ui'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'

export function ControlCard({
  currentTime,
  duration,
  loopStart,
  loopEnd,
  loopEnabled,
  playbackRate,
  isPlaying,
  isScrubbing,
  scrubTime,
  controlsDisabled,
  onIntervalChange,
  onScrubStart,
  onScrubEnd,
  onPlay,
  onPause,
  onRestartPlayer,
  onRestartLoop,
  onPlaybackRateChange,
}) {
  return (
    <Card className={`flex min-h-0 min-w-0 flex-col gap-4 p-4 mb-4 bg-card`}>
      <div className='order-2 flex w-full justify-between text-xs text-muted-foreground'>
        <span>{timestampFormatter(currentTime)}</span>
        <span>{timestampFormatter(duration)}</span>
      </div>

      <div className='order-2 w-full mb-8'>
        <div className='relative w-full'>
          {duration > 0 && loopEnd > loopStart && (
            <div
              className={`pointer-events-none absolute top-1/2 z-0 h-5 -translate-y-1/2 ${
                loopEnabled ? 'bg-muted-foreground/20' : 'bg-muted/40'
              }`}
              style={{
                left: `${(Math.max(0, loopStart) / duration) * 100}%`,
                width: `${
                  ((Math.min(duration, loopEnd) - Math.max(0, loopStart)) /
                    duration) *
                  100
                }%`,
              }}
            ></div>
          )}

          <div className='absolute inset-0 flex items-center z-10'>
            <Slider
              min={0}
              max={duration}
              step={0.1}
              value={[loopStart, loopEnd]}
              onValueChange={onIntervalChange}
              rangeClassName={
                loopEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
              }
              thumbClassNames={[
                `relative rounded-none border-0 border-l-2 ${
                  loopEnabled
                    ? 'border-l-emerald-500'
                    : 'border-l-muted-foreground/30'
                } before:absolute before:-bottom-8 before:h-7 before:w-5 before:rounded-full ${
                  loopEnabled
                    ? 'before:bg-emerald-500'
                    : 'before:bg-muted-foreground/30'
                }`,
                `relative before:-translate-x-full rounded-none border-0 border-r-2 ${
                  loopEnabled
                    ? 'border-r-red-500'
                    : 'border-r-muted-foreground/30'
                } before:absolute before:-bottom-8 before:h-7 before:w-5 before:rounded-full ${
                  loopEnabled
                    ? 'before:bg-red-500'
                    : 'before:bg-muted-foreground/30'
                }`,
              ]}
            />
          </div>

          <Slider
            min={0}
            max={duration}
            step={0.1}
            value={[isScrubbing ? scrubTime : currentTime]}
            onValueChange={val => {
              onScrubStart(val[0])
            }}
            onValueCommit={val => {
              onScrubEnd(val[0])
            }}
            className='relative z-20'
          />
        </div>
      </div>

      <div className='order-1 flex flex-col items-center gap-6'>
        <div className='flex flex-col w-full items-center justify-center gap-6'>
          <div className='w-[10rem]'>
            <div className='text-xs text-muted-foreground'>
              {playbackRate?.toFixed(2)}x
            </div>
            <Slider
              min={0.125}
              max={2}
              step={0.125}
              value={[playbackRate]}
              onValueChange={val => onPlaybackRateChange(val[0])}
            />
          </div>
          <div className='flex gap-5 sm:gap-3 items-center'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='h-10 w-10 rounded-md sm:h-10 sm:w-10'
                  onClick={onRestartPlayer}
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
                  className='h-10 w-10 rounded-md sm:h-10 sm:w-10'
                  onClick={onRestartLoop}
                >
                  <RotateCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Jump to loop start</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>
  )
}
