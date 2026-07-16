import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Flag,
  Home,
  ListMusic,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  Save,
  Settings2,
  SkipBack,
  Timer,
} from 'lucide-react'
import { timestampFormatter } from '@utils/video'
import { Button, Separator, Slider } from '@components/ui'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@components/ui/tooltip'
import {
  PlayerCard,
  TimeInputsCard,
  MeasureTraversalCard,
  LoopListCard,
  SongSettings,
} from './components'

const TABS = [
  { icon: Home, label: 'Home', isHome: true },
  { icon: Timer, label: 'Times' },
  { icon: ListMusic, label: 'Loops' },
  { icon: Settings2, label: 'Settings' },
]

export function MobileLayout({
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
  playerMetadata,
  measures,
  collapsedLoops,
  setCollapsedLoops,
  eqGains,
  eqPreset,
  type,
  isVideo,
  name,
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
  onLoopStartChange,
  onLoopEndChange,
  onCurrentTimeChange,
  onMeasuresChange,
  onLoadLoop,
  onDeleteLoop,
  onTitleChange,
  onBpmChange,
  onBeatsPerMeasureChange,
  onEqBandChange,
  onEqPresetChange,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState(1)
  const [showVideo, setShowVideo] = useState(true)

  return (
    <div className='flex flex-col h-full w-full'>
      {/* Video card — always mounted to keep media element in DOM, hidden via CSS when not needed */}
      <div className={`flex-none px-2 pt-2 ${!(isVideo && showVideo) ? 'hidden' : ''}`}>
          <PlayerCard
            mediaPlayerRef={mediaPlayerRef}
          isLoading={isLoading}
          isVideo={isVideo}
          name={name}
          videoOnly={true}
          showVideo={showVideo}
          onShowVideoChange={setShowVideo}
        />
      </div>

      <div className='flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-2'>
        {activeTab === 1 && (
          <>
            <TimeInputsCard
              loopStart={loopStart}
              loopEnd={loopEnd}
              currentTime={currentTime}
              duration={duration}
              controlsDisabled={controlsDisabled}
              onLoopStartChange={onLoopStartChange}
              onLoopEndChange={onLoopEndChange}
              onCurrentTimeChange={onCurrentTimeChange}
            />
            <MeasureTraversalCard
              bpm={playerMetadata.bpm}
              beatsPerMeasure={playerMetadata.beatsPerMeasure}
              measures={measures}
              loopStart={loopStart}
              loopEnd={loopEnd}
              onLoopStartChange={onLoopStartChange}
              onLoopEndChange={onLoopEndChange}
              onSeek={onSeek}
              onMeasuresChange={onMeasuresChange}
            />
          </>
        )}

        {activeTab === 2 && (
          <LoopListCard
            loops={playerMetadata.loops}
            loopStart={loopStart}
            loopEnd={loopEnd}
            collapsedLoops={collapsedLoops}
            setCollapsedLoops={setCollapsedLoops}
            onLoadLoop={onLoadLoop}
            onDeleteLoop={onDeleteLoop}
            onTitleChange={onTitleChange}
            className='flex-1'
          />
        )}

        {activeTab === 3 && (
          <SongSettings
            hideHeader
            onClose={() => setActiveTab(1)}
            type={type}
            bpm={playerMetadata.bpm}
            beatsPerMeasure={playerMetadata.beatsPerMeasure}
            onBpmChange={onBpmChange}
            onBeatsPerMeasureChange={onBeatsPerMeasureChange}
            gains={eqGains}
            onBandChange={onEqBandChange}
            activePreset={eqPreset}
            onPresetChange={onEqPresetChange}
            playerRef={mediaPlayerRef}
          />
        )}
      </div>

      <div className='flex-none border-t bg-background'>
        {/* Player controls */}
        <div className='px-3 pt-3 pb-1 flex flex-col gap-3'>
          {name && (
            <div className='truncate text-sm font-medium'>{name}</div>
          )}

          {isLoading && !(isVideo && showVideo) && <LoaderCircle className='animate-spin' />}

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
                onValueChange={val => onScrubStart(val[0])}
                onValueCommit={val => onScrubEnd(val[0])}
                className='relative z-20'
              />
            </div>
          </div>

          <div className='order-1 mt-8 flex flex-col items-center gap-6'>
            <div className='flex w-full items-center justify-center gap-6'>
              <div className='flex gap-3 items-center'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='h-10 w-10 rounded-md'
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
                      className='h-10 w-10 rounded-md'
                      onClick={onRestartLoop}
                    >
                      <RotateCcw />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Jump to loop start</TooltipContent>
                </Tooltip>
              </div>

              <div className='flex gap-3 items-center'>
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

          <div className='order-3 flex w-full items-center justify-between pb-1'>
            <div className='flex items-center gap-2 flex-1 max-w-[12rem]'>
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

            {isVideo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='xs'
                    onClick={() => setShowVideo(v => !v)}
                    aria-label={showVideo ? 'Hide video' : 'Show video'}
                  >
                    {showVideo ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showVideo ? 'Hide video' : 'Show video'}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <Separator />

        <div className='flex'>
          {TABS.map(({ icon: Icon, label, isHome }, index) => (
            <button
              key={index}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                !isHome && activeTab === index
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
              onClick={() => (isHome ? onClose() : setActiveTab(index))}
              aria-label={label}
            >
              <Icon
                className={`h-5 w-5 ${!isHome && activeTab === index ? 'stroke-[2.5]' : ''}`}
              />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
