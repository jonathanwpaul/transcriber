import { useState } from 'react'
import { ListMusic, Settings2, Timer } from 'lucide-react'
import {
  PlayerCard,
  TimeInputsCard,
  MeasureTraversalCard,
  LoopListCard,
  SongSettings,
} from './components'

const TABS = [
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
}) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className='flex flex-col h-full w-full'>
      <div className='flex-none px-2 pt-2'>
        <PlayerCard
          mediaPlayerRef={mediaPlayerRef}
          isLoading={isLoading}
          currentTime={currentTime}
          duration={duration}
          loopStart={loopStart}
          loopEnd={loopEnd}
          playbackRate={playbackRate}
          isPlaying={isPlaying}
          isScrubbing={isScrubbing}
          scrubTime={scrubTime}
          controlsDisabled={controlsDisabled}
          onIntervalChange={onIntervalChange}
          onSeek={onSeek}
          onScrubStart={onScrubStart}
          onScrubEnd={onScrubEnd}
          onPlay={onPlay}
          onPause={onPause}
          onRestartPlayer={onRestartPlayer}
          onRestartLoop={onRestartLoop}
          onMarkLoopStart={onMarkLoopStart}
          onMarkLoopEnd={onMarkLoopEnd}
          onSaveLoop={onSaveLoop}
          onPlaybackRateChange={onPlaybackRateChange}
        />
      </div>

      <div className='flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-2'>
        {activeTab === 0 && (
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

        {activeTab === 1 && (
          <LoopListCard
            loops={playerMetadata.loops}
            loopStart={loopStart}
            loopEnd={loopEnd}
            collapsedLoops={collapsedLoops}
            setCollapsedLoops={setCollapsedLoops}
            onLoadLoop={onLoadLoop}
            onDeleteLoop={onDeleteLoop}
            onTitleChange={onTitleChange}
          />
        )}

        {activeTab === 2 && (
          <SongSettings
            onClose={() => setActiveTab(0)}
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

      <nav className='flex-none border-t bg-background'>
        <div className='flex'>
          {TABS.map(({ icon: Icon, label }, index) => (
            <button
              key={index}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                activeTab === index
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab(index)}
              aria-label={label}
            >
              <Icon
                className={`h-5 w-5 ${activeTab === index ? 'stroke-[2.5]' : ''}`}
              />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
