// Abstract base class for all media players.
// This will be fleshed out in a later step according to MEDIA_PLAYER_REFACTOR_PLAN.md.

export class MediaPlayer {
  constructor({ id, storage, callbacks = {}, source = {} } = {}) {
    if (new.target === MediaPlayer) {
      throw new Error('MediaPlayer is abstract and cannot be instantiated directly');
    }

    this.id = id;
    this.storage = storage;
    this.callbacks = callbacks;
    this.source = source; // e.g. { sourceUrl, mimeType }
  }

  // Core control methods – subclasses must override.
  play() {
    throw new Error('play() must be implemented by subclasses');
  }

  pause() {
    throw new Error('pause() must be implemented by subclasses');
  }

  seekTo(_seconds) {
    throw new Error('seekTo() must be implemented by subclasses');
  }

  setPlaybackRate(_rate) {
    throw new Error('setPlaybackRate() must be implemented by subclasses');
  }

  getCurrentTime() {
    throw new Error('getCurrentTime() must be implemented by subclasses');
  }

  getDuration() {
    throw new Error('getDuration() must be implemented by subclasses');
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
    throw new Error('renderComponent() must be implemented by subclasses');
  }
}
