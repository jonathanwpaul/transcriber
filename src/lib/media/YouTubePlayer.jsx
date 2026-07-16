import React from 'react'
import YouTube from 'react-youtube'

import { MediaPlayer } from './MediaPlayer'

// YouTubePlayer wraps react-youtube and adapts it to the MediaPlayer interface.
// It is responsible for wiring YouTube API events to MediaPlayer callbacks and
// keeping MediaPlayer state in sync with the iframe player.

export class YouTubePlayer extends MediaPlayer {
  constructor(args) {
    super(args)
    this._player = null
    this._timeInterval = null
  }

  // ----- Internal helpers -----

  _startTimeUpdates() {
    if (!this._player || this._timeInterval) return

    this._timeInterval = setInterval(() => {
      const current = this._player.getCurrentTime?.()
      if (typeof current === 'number') {
        this._updateCurrentTime(current)
      }
    }, 100)
  }

  _stopTimeUpdates() {
    if (this._timeInterval) {
      clearInterval(this._timeInterval)
      this._timeInterval = null
    }
  }

  _handleReady = async e => {
    this._player = e.target

    // Wait for metadata from storage so we can apply persisted settings.
    if (this.whenReady) {
      await this.whenReady()
    }

    const duration = this._player.getDuration?.() ?? 0
    const current = this._player.getCurrentTime?.() ?? 0
    const rate = this._player.getPlaybackRate?.() ?? 1
    const videoData = this._player.getVideoData?.() ?? {}

    this._updateDuration(duration)
    this._updateCurrentTime(current)
    this._updatePlaybackRate(rate)

    if (videoData.title) {
      this.setName(videoData.title)
    }

    // If we have a lastPlaybackPosition persisted, seek to it.
    if (this._metadata?.lastPlaybackPosition != null) {
      try {
        this.seekTo(this._metadata.lastPlaybackPosition)
      } catch {
        // If seek fails, ignore – player may not be fully ready.
      }
    }

    this.callbacks.onReady({
      duration,
      currentTime: current,
      playbackRate: rate,
      rhythmLocked: this._metadata.bpm && this._metadata.beatsPerMeasure,
    })
  }

  _handlePlay = () => {
    this._updateIsPlaying(true)
    this._startTimeUpdates()
  }

  _handlePause = () => {
    this._updateIsPlaying(false)
    this._stopTimeUpdates()
  }

  // ----- Core control methods -----

  play() {
    if (!this._player || !this._player.playVideo) return
    this._player.playVideo()
    this._handlePlay()
  }

  pause() {
    if (!this._player || !this._player.pauseVideo) return
    this._player.pauseVideo()
    this._handlePause()
  }

  seekTo(seconds) {
    if (!this._player || !this._player.seekTo) return
    this._player.seekTo(seconds, true)
    this._updateCurrentTime(seconds)
  }

  setPlaybackRate(rate) {
    if (!this._player || !this._player.setPlaybackRate) return
    this._player.setPlaybackRate(rate)
    this._updatePlaybackRate(rate)
  }

  getCurrentTime() {
    if (!this._player || !this._player.getCurrentTime) return this.currentTime
    return this._player.getCurrentTime()
  }

  getDuration() {
    if (!this._player || !this._player.getDuration) return this.duration
    return this._player.getDuration()
  }

  // ----- Lifecycle -----

  destroy() {
    this._stopTimeUpdates()
    this._player = null
  }

  // ----- Rendering -----

  renderComponent({ constrainHeight = false } = {}) {
    const videoOptions = {
      playerVars: {
        controls: 1,
      },
    }

    const videoId = this._metadata?.link

    if (!videoId) return null

    return (
      <div className={`overflow-hidden rounded-lg border bg-card ${constrainHeight ? 'h-full max-h-full max-w-full aspect-video' : 'w-full flex-none'}`}>
        <div className='relative h-full w-full'>
          <YouTube
            opts={videoOptions}
            videoId={videoId}
            onReady={this._handleReady}
            onPlay={this._handlePlay}
            onPause={this._handlePause}
            className='absolute inset-0 h-full w-full'
          />
        </div>
      </div>
    )
  }
}
