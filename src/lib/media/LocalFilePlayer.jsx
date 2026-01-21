import React from 'react'

import { MediaPlayer } from './MediaPlayer'

// LocalFilePlayer will drive an HTMLMediaElement (<audio> or <video>) for local files
// and optionally use the Web Audio API for advanced processing.
// This file currently contains only the class skeleton; behavior will be added in a later step.

export class LocalFilePlayer extends MediaPlayer {
  constructor(args) {
    super(args)
  }

  // Implement core control methods in a later step.
  play() {
    super.play()
  }

  pause() {
    super.pause()
  }

  seekTo(seconds) {
    super.seekTo(seconds)
  }

  setPlaybackRate(rate) {
    super.setPlaybackRate(rate)
  }

  getCurrentTime() {
    return super.getCurrentTime()
  }

  getDuration() {
    return super.getDuration()
  }

  // LocalFilePlayer can override advanced processing hooks using Web Audio API later.

  renderComponent() {
    // Will eventually return an <audio> or <video> element wired to this instance.
    return null
  }
}
