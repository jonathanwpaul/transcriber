import { useState } from 'react'

import {
  LoopListCard,
  LoopControlsCard,
  MediaCard,
  MeasureTraversalCard,
  ControlCard,
  SongSettings,
  TimeInputsCard,
} from './components'
import { PlayerTabBar } from './PlayerTabBar'

export function PlayerLayout({
  mediaPlayerRef,
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
  loopEnabled,
  onLoopEnabledChange,
  showVideo,
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
  showToast,
  globalStart,
  onGlobalStartChange,
}) {
  const [activeTab, setActiveTab] = useState(1)

  const loopControlsCard = (
    <div className={activeTab === 1 ? 'block' : 'hidden sm:block'}>
      <LoopControlsCard
        loopEnabled={loopEnabled}
        onLoopEnabledChange={onLoopEnabledChange}
        onMarkLoopStart={onMarkLoopStart}
        onSaveLoop={onSaveLoop}
        onMarkLoopEnd={onMarkLoopEnd}
      />
    </div>
  )

  const measureTraversalCard = (
    <div className={activeTab === 1 ? 'block' : 'hidden sm:block'}>
      <MeasureTraversalCard
        bpm={playerMetadata.bpm}
        beatsPerMeasure={playerMetadata.beatsPerMeasure}
        measures={measures}
        loopStart={loopStart}
        loopEnd={loopEnd}
        loopEnabled={loopEnabled}
        onLoopStartChange={onLoopStartChange}
        onLoopEndChange={onLoopEndChange}
        onSeek={onSeek}
        onMeasuresChange={onMeasuresChange}
        showToast={showToast}
        currentTime={currentTime}
        globalStart={globalStart}
        onGlobalStartChange={onGlobalStartChange}
      />
    </div>
  )

  const timeInputsCard = (
    <div className={activeTab === 1 ? 'block' : 'hidden sm:block'}>
      <TimeInputsCard
        loopStart={loopStart}
        loopEnd={loopEnd}
        currentTime={currentTime}
        duration={duration}
        controlsDisabled={controlsDisabled}
        loopEnabled={loopEnabled}
        onLoopStartChange={onLoopStartChange}
        onLoopEndChange={onLoopEndChange}
        onCurrentTimeChange={onCurrentTimeChange}
      />
    </div>
  )

  const settingsCard = (
    <div className={activeTab === 3 ? 'block sm:hidden' : 'hidden'}>
      <SongSettings
        hideHeader
        type={type}
        bpm={playerMetadata.bpm}
        beatsPerMeasure={playerMetadata.beatsPerMeasure}
        onBpmChange={onBpmChange}
        onBeatsPerMeasureChange={onBeatsPerMeasureChange}
        globalStart={globalStart}
        onGlobalStartChange={onGlobalStartChange}
        gains={eqGains}
        onBandChange={onEqBandChange}
        activePreset={eqPreset}
        onPresetChange={onEqPresetChange}
        playerRef={mediaPlayerRef}
        showVideo={showVideo}
        onShowVideoChange={onShowVideoChange}
      />
    </div>
  )

  const loopsCard = (
    <div
      className={`min-h-0 sm:flex-1 sm:flex sm:flex-col ${activeTab === 2 ? 'block' : 'hidden'}`}
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
    <div className='relative flex h-full min-h-0 w-full flex-col gap-2 sm:pb-2'>
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto sm:flex-row sm:flex-wrap sm:overflow-hidden'>
        <section
          className={`flex flex-col gap-2 p-2 sm:min-h-0 sm:flex-[1.2] sm:min-w-[320px] ${
            activeTab === 3 ? 'max-sm:hidden' : ''
          }`}
        >
          <MediaCard
            mediaPlayerRef={mediaPlayerRef}
            isVideo={isVideo}
            showVideo={showVideo}
          />
          {loopControlsCard}
          {timeInputsCard}
          {!showVideo && measureTraversalCard}
        </section>

        <section className='flex flex-col gap-2 p-2 sm:min-h-0 sm:flex-1 sm:min-w-[260px] sm:overflow-y-auto'>
          {showVideo && measureTraversalCard}
          {loopsCard}
          {settingsCard}
        </section>
      </div>

      <ControlCard
        mediaPlayerRef={mediaPlayerRef}
        currentTime={currentTime}
        duration={duration}
        loopStart={loopStart}
        loopEnd={loopEnd}
        loopEnabled={loopEnabled}
        playbackRate={playbackRate}
        isPlaying={isPlaying}
        isScrubbing={isScrubbing}
        scrubTime={scrubTime}
        songName={playerMetadata.name}
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
