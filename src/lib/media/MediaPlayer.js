// Abstract base class for all media players.
// Handles shared metadata, playback state, storage integration, and callback wiring.

import { getVideos, setVideos } from '@lib/storage/mediaPreferencesService'

export class MediaPlayer {
  constructor({ id, callbacks = {}, source = {} } = {}) {
    if (new.target === MediaPlayer) {
      throw new Error(
        'MediaPlayer is abstract and cannot be instantiated directly',
      )
    }

    this.id = id
    this.source = source // e.g. { sourceUrl, mimeType }

    // Callbacks from the host (Player) – all optional.
    this.callbacks = {
      onReady: callbacks.onReady ?? (() => {}),
      onDuration: callbacks.onDuration ?? (() => {}),
      onTimeUpdate: callbacks.onTimeUpdate ?? (() => {}),
      onPlaybackRateChange: callbacks.onPlaybackRateChange ?? (() => {}),
      onPlayingChange: callbacks.onPlayingChange ?? (() => {}),
      onMetadataChange: callbacks.onMetadataChange ?? (() => {}),
    }

    // In-memory playback state (not persisted every frame).
    this._currentTime = 0
    this._duration = 0
    this._isPlaying = false
    this._playbackRate = 1

    // Persisted metadata for this media id.
    this._metadata = {
      bpm: null,
      beatsPerMeasure: null,
      loops: null,
      title: null,
      lastLoopSelected: null,
      lastPlaybackRate: null,
      lastLoopStartPosition: null,
      lastLoopEndPosition: null,
      lastPlaybackPosition: null,
    }

    // Async initialization: load metadata from storage.
    this._readyPromise = this._loadInitialMetadata()
  }

  // ----- Initialization & storage helpers -----

  async _loadInitialMetadata() {
    if (!this.id) return

    const videos = await getVideos()
    const entry = videos?.[this.id] ?? {}

    this._metadata = {
      ...this._metadata,
      bpm: entry.bpm ?? this._metadata.bpm,
      beatsPerMeasure: entry.beatsPerMeasure ?? this._metadata.beatsPerMeasure,
      loops: entry.loops ?? this._metadata.loops,
      title: entry.title ?? this._metadata.title,
      lastLoopSelected:
        entry.lastLoopSelected ?? this._metadata.lastLoopSelected,
      lastPlaybackRate:
        entry.lastPlaybackRate ?? this._metadata.lastPlaybackRate,
      lastLoopStartPosition:
        entry.lastLoopStartPosition ?? this._metadata.lastLoopStartPosition,
      lastLoopEndPosition:
        entry.lastLoopEndPosition ?? this._metadata.lastLoopEndPosition,
      lastPlaybackPosition:
        entry.lastPlaybackPosition ?? this._metadata.lastPlaybackPosition,
    }

    this.callbacks.onMetadataChange(this._metadata)
  }

  /**
   * Returns a promise that resolves once initial metadata has been loaded.
   */
  whenReady() {
    return this._readyPromise
  }

  async _saveMetadata(patch) {
    if (!this.id) return

    const videos = await getVideos()
    const entry = videos?.[this.id] ?? {}

    const nextEntry = {
      ...entry,
      ...patch,
    }

    await setVideos({
      ...videos,
      [this.id]: nextEntry,
    })

    this._metadata = {
      ...this._metadata,
      ...patch,
    }

    this.callbacks.onMetadataChange(this._metadata)
  }

  // ----- Metadata getters/setters (persisted fields) -----

  get bpm() {
    return this._metadata.bpm
  }

  async setBpm(bpm) {
    await this._saveMetadata({ bpm })
  }

  get beatsPerMeasure() {
    return this._metadata.beatsPerMeasure
  }

  async setBeatsPerMeasure(beatsPerMeasure) {
    await this._saveMetadata({ beatsPerMeasure })
  }

  get loops() {
    return this._metadata.loops
  }

  async setLoops(loops) {
    await this._saveMetadata({ loops })
  }

  get title() {
    return this._metadata.title
  }

  async setTitle(title) {
    await this._saveMetadata({ title })
  }

  async setLastLoopSelected(lastLoopSelected) {
    await this._saveMetadata({ lastLoopSelected })
  }

  async setLastPlaybackRate(lastPlaybackRate) {
    await this._saveMetadata({ lastPlaybackRate })
  }

  async setLastSectionPositions(start, end) {
    await this._saveMetadata({
      lastLoopStartPosition: start,
      lastLoopEndPosition: end,
    })
  }

  async setLastPlaybackPosition(lastPlaybackPosition) {
    await this._saveMetadata({ lastPlaybackPosition })
  }

  // ----- In-memory playback state (not persisted every frame) -----

  get currentTime() {
    return this._currentTime
  }

  // Subclasses should call this when their underlying player time changes.
  _updateCurrentTime(seconds) {
    this._currentTime = seconds
    this.callbacks.onTimeUpdate(seconds)
  }

  get duration() {
    return this._duration
  }

  _updateDuration(seconds) {
    this._duration = seconds
    this.callbacks.onDuration(seconds)
  }

  get isPlaying() {
    return this._isPlaying
  }

  _updateIsPlaying(isPlaying) {
    this._isPlaying = isPlaying
    this.callbacks.onPlayingChange(isPlaying)
  }

  get playbackRate() {
    return this._playbackRate
  }

  _updatePlaybackRate(rate) {
    this._playbackRate = rate
    this.callbacks.onPlaybackRateChange(rate)
  }

  // ----- Core control methods – subclasses must override -----

  play() {
    throw new Error('play() must be implemented by subclasses')
  }

  pause() {
    throw new Error('pause() must be implemented by subclasses')
  }

  // Subclasses should call _updateCurrentTime when seek completes.
  seekTo(_seconds) {
    throw new Error('seekTo() must be implemented by subclasses')
  }

  setPlaybackRate(_rate) {
    throw new Error('setPlaybackRate() must be implemented by subclasses')
  }

  getCurrentTime() {
    throw new Error('getCurrentTime() must be implemented by subclasses')
  }

  getDuration() {
    throw new Error('getDuration() must be implemented by subclasses')
  }

  // Optional advanced processing hooks (equalizer, filters, etc.).
  // Subclasses like LocalFilePlayer can override these using the Web Audio API.
  setEqualizerSettings(_settings) {
    // no-op by default
  }

  // Lifecycle hook for cleanup.
  destroy() {
    // Subclasses can override; default is no-op.
  }

  // Subclasses must return a React element that renders the underlying player UI.
  renderComponent() {
    throw new Error('renderComponent() must be implemented by subclasses')
  }
}
