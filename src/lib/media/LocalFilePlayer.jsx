import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'

import { MediaPlayer } from './MediaPlayer'

// LocalFilePlayer drives an HTMLMediaElement (<audio> or <video>) for local files
// and can optionally use the Web Audio API for advanced audio processing.

export class LocalFilePlayer extends MediaPlayer {
  constructor(args) {
    super(args)
    this._mediaElement = null
    this._audioContext = null
    this._audioSourceNode = null
  }

  _startTimeUpdates() {
    if (!this._mediaElement) return

    this._timeInterval = setInterval(() => {
      const current = this._mediaElement.currentTime
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
  // Called by the React wrapper when the underlying media element mounts.
  _attachMediaElement(el) {
    this._mediaElement = el
  }

  // ----- Core control methods -----

  async play() {
    if (!this._mediaElement) return
    try {
      await this._mediaElement.play()
      this._updateIsPlaying(true)
    } catch {
      // Ignore play() rejections (e.g. autoplay restrictions).
    }
  }

  pause() {
    if (!this._mediaElement) return
    this._mediaElement.pause()
    this._updateIsPlaying(false)
  }

  seekTo(seconds) {
    if (!this._mediaElement) return
    this._mediaElement.currentTime = seconds
  }

  setPlaybackRate(rate) {
    if (!this._mediaElement) return
    this._mediaElement.playbackRate = rate
    this._updatePlaybackRate(rate)
  }

  getCurrentTime() {
    if (!this._mediaElement) return this.currentTime
    return this._mediaElement.currentTime ?? 0
  }

  getDuration() {
    if (!this._mediaElement) return this.duration
    return this._mediaElement.duration ?? 0
  }

  // ----- Lifecycle -----

  destroy() {
    if (this._mediaElement) {
      this._mediaElement.pause()
    }
    if (this._audioSourceNode) {
      try {
        this._audioSourceNode.disconnect()
      } catch {}
      this._audioSourceNode = null
    }
    // Do not close the AudioContext here; it is owned by the React effect
    // cleanup in LocalFileMediaElement. That avoids double-closing when the
    // player is destroyed and the component unmounts.
    this._audioContext = null
    this._mediaElement = null
  }

  // ----- Rendering -----

  renderComponent() {
    return <LocalFileMediaElement player={this} />
  }
}

function LocalFileMediaElement({ player }) {
  const mediaRef = useRef(null)

  const metadata = player._metadata || {}
  const mergedSource = {
    sourceUrl:
      metadata.sourceUrl != null
        ? metadata.sourceUrl
        : player.source?.sourceUrl,
    mimeType:
      metadata.mimeType != null ? metadata.mimeType : player.source?.mimeType,
    filePath:
      metadata.filePath != null ? metadata.filePath : player.source?.filePath,
    fileDirectory:
      metadata.fileDirectory != null
        ? metadata.fileDirectory
        : player.source?.fileDirectory,
  }

  const { sourceUrl, mimeType, filePath, fileDirectory } = mergedSource
  const [resolvedSourceUrl, setResolvedSourceUrl] = useState(sourceUrl || null)

  const isVideo = mimeType?.startsWith('video')

  const setRef = useCallback(
    el => {
      mediaRef.current = el
      if (el) {
        player._attachMediaElement(el)
      }
    },
    [player],
  )

  useEffect(() => {
    let canceled = false

    async function resolveSource() {
      if (sourceUrl) {
        // Data URL built from DB blob content — use directly.
        if (!canceled) setResolvedSourceUrl(sourceUrl)
      } else if (filePath) {
        try {
          const directory = fileDirectory || Directory.Data
          let url
          if (Capacitor.isNativePlatform()) {
            const { uri } = await Filesystem.getUri({
              path: filePath,
              directory,
            })
            url = Capacitor.convertFileSrc(uri)
          } else {
            const result = await Filesystem.readFile({
              path: filePath,
              directory,
            })
            const mime = mimeType || 'application/octet-stream'
            url = `data:${mime};base64,${result.data}`
          }
          if (!canceled) setResolvedSourceUrl(url)
        } catch (err) {
          console.error('Failed to read local media from Filesystem', err)
          if (!canceled) setResolvedSourceUrl(null)
        }
      } else {
        setResolvedSourceUrl(null)
      }
    }

    resolveSource()

    return () => {
      canceled = true
    }
  }, [sourceUrl, filePath, fileDirectory, mimeType])

  useEffect(() => {
    const el = mediaRef.current
    // If we don't yet have a media element or a resolved source URL, there's
    // nothing to wire up. This effect will re-run once the element mounts or
    // the source changes.
    if (!el || !resolvedSourceUrl) return

    let audioContext = null
    let sourceNode = null

    const handleLoadedMetadata = async () => {
      const duration = el.duration ?? 0
      const current = el.currentTime ?? 0
      const rate = el.playbackRate ?? 1

      if (player.whenReady) {
        await player.whenReady()
      }

      player._updateDuration(duration)
      player._updateCurrentTime(current)
      player._updatePlaybackRate(rate)

      const meta = player._metadata ?? {}
      if (meta.lastPlaybackPosition != null) {
        el.currentTime = meta.lastPlaybackPosition
        player._updateCurrentTime(meta.lastPlaybackPosition)
      }
      if (meta.lastPlaybackRate != null) {
        el.playbackRate = meta.lastPlaybackRate
        player._updatePlaybackRate(meta.lastPlaybackRate)
      }

      player.callbacks.onReady({
        duration,
        currentTime: current,
        playbackRate: rate,
      })
    }

    const handlePlay = () => {
      player._updateIsPlaying(true)
      player._startTimeUpdates()
    }

    const handlePause = () => {
      player._updateIsPlaying(false)
      player._stopTimeUpdates()
    }

    const handleRateChange = () => {
      player._updatePlaybackRate(el.playbackRate ?? 1)
    }

    el.addEventListener('loadedmetadata', handleLoadedMetadata)
    el.addEventListener('play', handlePlay)
    el.addEventListener('pause', handlePause)
    el.addEventListener('ratechange', handleRateChange)

    // Optional Web Audio wiring for audio sources.
    const AudioCtx =
      typeof window !== 'undefined' &&
      (window.AudioContext || window.webkitAudioContext)

    if (!isVideo && AudioCtx && !player._audioContext) {
      try {
        audioContext = new AudioCtx()
        sourceNode = audioContext.createMediaElementSource(el)
        sourceNode.connect(audioContext.destination)

        player._audioContext = audioContext
        player._audioSourceNode = sourceNode
      } catch {
        // If Web Audio setup fails, fall back to plain HTMLMediaElement audio.
      }
    }

    return () => {
      el.removeEventListener('loadedmetadata', handleLoadedMetadata)
      el.removeEventListener('play', handlePlay)
      el.removeEventListener('pause', handlePause)
      el.removeEventListener('ratechange', handleRateChange)

      if (sourceNode) {
        try {
          sourceNode.disconnect()
        } catch {}
      }
      if (audioContext) {
        try {
          audioContext.close()
        } catch {}
      }
      // Clear references on the player so destroy() doesn't attempt to
      // disconnect/close them a second time.
      player._audioSourceNode = null
      player._audioContext = null
    }
  }, [player, isVideo, resolvedSourceUrl])

  if (!resolvedSourceUrl) {
    return null
  }

  const commonProps = {
    ref: setRef,
    src: resolvedSourceUrl,
    controls: true,
    className: isVideo ? 'absolute inset-0 h-full w-full' : 'w-full',
  }

  if (isVideo) {
    return (
      <div className='w-full overflow-hidden rounded-lg border bg-card flex-none'>
        <div className='relative w-full aspect-video'>
          <video {...commonProps} />
        </div>
      </div>
    )
  }

  return (
    <div className='w-full overflow-hidden rounded-lg border bg-card flex-none p-3'>
      <audio {...commonProps} />
    </div>
  )
}
