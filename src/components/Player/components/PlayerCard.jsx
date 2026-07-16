import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Flag,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  Save,
  SkipBack,
} from 'lucide-react'
import { timestampFormatter } from '@utils/video'
import { Button, Card, Separator, Slider } from '@components/ui'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@components/ui/tooltip'

export function PlayerCard({
  mediaPlayerRef,
  isLoading,
  currentTime,
  duration,
  loopStart,
  loopEnd,
  playbackRate,
  isPlaying,
  isScrubbing,
  scrubTime,
  controlsDisabled,
  isVideo,
  name,
  videoOnly = false,
  controlsOnly = false,
  showVideo: showVideoProp,
  onShowVideoChange,
  onIntervalChange,
  onSeek,
  onScrubStart,
  onScrubEnd,
  onPlay,
  onPause,
  onRestartPlayer,
  onRestartLoop,
  onMarkLoopStart,
  onMarkLoopEnd,
  onSaveLoop,
  onPlaybackRateChange,
}) {
  const [internalShowVideo, setInternalShowVideo] = useState(true)
  const effectiveShowVideo = showVideoProp !== undefined ? showVideoProp : internalShowVideo
  const handleToggle = showVideoProp !== undefined
    ? () => onShowVideoChange(v => !v)
    : () => setInternalShowVideo(v => !v)

  const renderMedia = constrainHeight => mediaPlayerRef.current?.renderComponent({ constrainHeight })

  if (videoOnly) {
    return (
      <Card className='flex h-full min-h-0 flex-col gap-4 overflow-hidden p-4'>
        {isLoading && <LoaderCircle className='animate-spin' />}
        {mediaPlayerRef.current && (
          <div className='relative flex min-h-0 flex-1 justify-center'>
            <div className={`h-full min-h-0 ${isVideo && !effectiveShowVideo ? 'hidden' : ''}`}>
              {renderMedia(isVideo)}
            </div>
            {isVideo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='xs'
                    className='absolute top-1 right-1'
                    onClick={handleToggle}
                    aria-label={effectiveShowVideo ? 'Hide video' : 'Show video'}
                  >
                    {effectiveShowVideo ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{effectiveShowVideo ? 'Hide video' : 'Show video'}</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className={`flex min-h-0 flex-col gap-4 p-4 ${controlsOnly ? 'flex-none' : 'h-full overflow-y-auto'}`}>
      {isLoading && controlsOnly && <LoaderCircle className='animate-spin' />}
      {!controlsOnly && mediaPlayerRef.current && (
        <div className={`relative ${isVideo ? 'min-h-0 flex-1 flex justify-center' : ''}`}>
          <div className={`h-full ${isVideo && !effectiveShowVideo ? 'hidden' : ''}`}>
            {renderMedia(isVideo)}
          </div>
          {isVideo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='xs'
                  className='absolute top-1 right-1'
                  onClick={handleToggle}
                  aria-label={effectiveShowVideo ? 'Hide video' : 'Show video'}
                >
                  {effectiveShowVideo ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{effectiveShowVideo ? 'Hide video' : 'Show video'}</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      <div className='order-2 flex w-full justify-between text-xs text-muted-foreground'>
        <span>{timestampFormatter(currentTime)}</span>
        <span>{timestampFormatter(duration)}</span>
      </div>

      <div className='order-2 w-full'>
        <div className='relative w-full'>
          {duration > 0 && loopEnd > loopStart && (
            <div
              className='pointer-events-none absolute top-1/2 -translate-y-1/2 h-5 bg-muted-foreground/20 z-0'
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

          <div className='absolute inset-0 flex items-center z-10'>
            <Slider
              min={0}
              max={duration}
              step={0.1}
              value={[loopStart, loopEnd]}
              onValueChange={onIntervalChange}
              className='relative'
              thumbClassNames={[
                'relative rounded-none border-0 border-l-2 border-l-emerald-500 before:absolute before:-bottom-8 before:h-7 before:w-5 before:rounded-full before:bg-emerald-500',
                'relative before:-translate-x-full rounded-none border-0 border-r-2 border-r-red-500 before:absolute before:-bottom-8 before:h-7 before:w-5 before:rounded-full before:bg-red-500',
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

      <div className='order-1 mt-8 flex flex-col items-center gap-6'>
        <div className='flex flex-col sm:flex-row w-full items-center justify-center gap-6'>
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

          <Separator className='hidden sm:block' orientation='vertical' />

          <div className='flex gap-5 sm:gap-3 items-center'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='h-10 w-10 rounded-md'
                  onClick={onMarkLoopStart}
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
                  onClick={onSaveLoop}
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
                  onClick={onMarkLoopEnd}
                >
                  <Flag className='text-red-500' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark loop end</TooltipContent>
            </Tooltip>
          </div>
        </div>

      </div>

      <div className='order-3 flex w-full justify-center'>
        <div className='flex items-center gap-2 w-full max-w-[12rem]'>
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
      </div>
    </Card>
  )
}
