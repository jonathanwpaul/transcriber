import {
  PlayerCard,
  TimeInputsCard,
  MeasureTraversalCard,
  LoopListCard,
  SongSettings,
} from './components'

export function DesktopLayout({
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
  }) {
  return (
    <div className='flex h-full min-h-0 w-full flex-col gap-2 px-2 pb-6'>
      <div className='grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1.5fr_1fr_1fr] lg:overflow-hidden'>
        <section className='h-full min-h-0 overflow-y-auto md:p-2'>
          <PlayerCard
            mediaPlayerRef={mediaPlayerRef}
            isLoading={isLoading}
            isVideo={isVideo}
            videoOnly
          />
        </section>

        <section className='h-full min-h-0 pt-6 pb-6 md:p-2 flex flex-col gap-2 lg:overflow-y-auto'>
          {showSettings ? (
            <SongSettings
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
          ) : (
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
        </section>

        <section className='h-full min-h-0 pt-6 pb-6 md:p-2 flex flex-col gap-2 overflow-y-auto'>
          {!showSettings && (
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
        </section>
      </div>

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
    </div>
  )
}
