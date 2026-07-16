import { useState } from 'react'

import {
  LoopListCard,
  MediaCard,
  MeasureTraversalCard,
  ControlCard,
  SongSettings,
  TimeInputsCard,
} from './components'
import { PlayerTabBar } from './PlayerTabBar'

export function PlayerLayout({
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
  showSettings,
  onToggleSettings,
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

  const timeCards = (
    <div className={activeTab === 1 ? 'block' : 'hidden lg:block'}>
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
    </div>
  )

  const settingsCard = (
    <div className={showSettings || activeTab === 3 ? 'block' : 'hidden'}>
      <SongSettings
        hideHeader
        onClose={onToggleSettings}
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
    </div>
  )

  const loopsCard = (
    <div
      className={!showSettings && activeTab === 2 ? 'block' : 'hidden lg:block'}
    >
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
    </div>
  )

  return (
    <div className='flex h-full min-h-0 w-full flex-col gap-2 px-2 sm:pb-2'>
      <div className='grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:overflow-hidden'>
        <section className='min-w-0 p-2 lg:h-full lg:min-h-0'>
          <MediaCard
            mediaPlayerRef={mediaPlayerRef}
            isLoading={isLoading}
            isVideo={isVideo}
          />
        </section>

        <section className='min-w-0 p-2 lg:min-h-0 lg:overflow-y-auto'>
          {showSettings ? settingsCard : timeCards}
          {showSettings ? null : loopsCard}
          <div className='lg:hidden'>{activeTab === 3 && settingsCard}</div>
        </section>
      </div>

      <ControlCard
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
        isVideo={isVideo}
        controlsOnly
        onIntervalChange={onIntervalChange}
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

      <PlayerTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={onClose}
      />
    </div>
  )
}
