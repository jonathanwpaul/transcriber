import YouTube from 'react-youtube'
import { videoSources } from '@utils/constants'
import { round } from '@utils/video'
import { useRef } from 'react'

export const YouTubeSource = ({
  onPlay,
  onPause,
  id,
  playerRef,
  setVideos,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setPlaybackRate,
  setPossiblePlaybackRates,
  setSectionStart,
  setSectionEnd,
  timerRef,
  videos,
}) => {
  const videoOptions = {
    playerVars: {
      controls: 1,
      fs: 1,
    },
  }
  const type = videos[id].type || videoSources.FILE
  /**
   * initializes the playerStatus when the youtube api is ready
   * @param {*} e the event from the youtube iframe
   */
  const onReady = e => {
    playerRef.current = e.target
    videos[id].title = playerRef.current.getVideoData().title
    setVideos('videos', videos)
    setCurrentTime(round(e.target.getCurrentTime()))
    setDuration(playerRef.current.getDuration())
    setIsPlaying(e.target.getPlayerState() === 1)
    setPlaybackRate(e.target.getPlaybackRate())
    setPossiblePlaybackRates(e.target.getAvailablePlaybackRates())
    setSectionStart(0)
    setSectionEnd(e.target.getDuration())
  }

  const audioRef = useRef()

  if (audioRef.current) {
    audioRef.current.onplay = onPlay
    audioRef.current.onpause = onPause
  }

  return (
    <>
      {type === videoSources.YOUTUBE && (
        <YouTube
          opts={videoOptions}
          videoId={id}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          style={{ aspectRatio: '16/9' }}
        />
      )}
      {type === videoSources.FILE && (
        <audio ref={audioRef} controls>
          <source src={id} />
        </audio>
      )}
    </>
  )
}
