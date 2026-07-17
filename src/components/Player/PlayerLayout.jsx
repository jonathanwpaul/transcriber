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
}) {
  const [activeTab, setActiveTab] = useState(1)

  const timeCards = (
    <div
      className={`flex flex-col gap-2 ${
        activeTab === 1 ? 'block' : 'hidden lg:flex'
      }`}
    >
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
      <LoopControlsCard
        loopEnabled={loopEnabled}
        onLoopEnabledChange={onLoopEnabledChange}
        onMarkLoopStart={onMarkLoopStart}
        onSaveLoop={onSaveLoop}
        onMarkLoopEnd={onMarkLoopEnd}
      />
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
      className={activeTab === 2 ? 'block lg:block' : 'hidden lg:block'}
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
    <div className='relative flex h-full min-h-0 w-full flex-col gap-2 px-2 sm:pb-2'>
      <div className='grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:overflow-hidden'>
        <section
          className={`min-w-0 p-2 lg:h-full lg:min-h-0 ${
            activeTab === 3 ? 'max-sm:hidden' : ''
          }`}
        >
          <MediaCard
            mediaPlayerRef={mediaPlayerRef}
            isVideo={isVideo}
            showVideo={showVideo}
          />
        </section>

        <section className='flex min-w-0 flex-col gap-2 p-2 lg:min-h-0 lg:overflow-y-auto'>
          {timeCards}
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
