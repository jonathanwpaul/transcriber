import React from 'react'

import { MediaPlayer } from './MediaPlayer'

// YouTubePlayer will wrap react-youtube and adapt it to the MediaPlayer interface.
// This file currently contains only the class skeleton; behavior will be added in a later step.

export class YouTubePlayer extends MediaPlayer {
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

  renderComponent() {
    // Will eventually return the <YouTube /> component wired to this instance.
    return null
  }
}
