import YouTube from 'react-youtube'
import { videoSources } from '@utils/constants'
import { round } from '@utils/video'

export const YouTubeSource = ({
  id,
  onPause,
  onPlay,
  playerRef,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setPlaybackRate,
  setSectionEnd,
  setSectionStart,
  setVideos,
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
    setSectionStart(0)
    setSectionEnd(e.target.getDuration())

    playerRef.current.play = () => {
      playerRef.current.playVideo()
    }

    playerRef.current.pause = () => {
      playerRef.current.pauseVideo()
    }
  }

  return (
    <>
      {type === videoSources.YOUTUBE && (
        <div className="w-full overflow-hidden rounded-lg border bg-card">
          <div className="aspect-video w-full">
            <YouTube
              opts={videoOptions}
              videoId={id}
              onReady={onReady}
              onPlay={onPlay}
              onPause={onPause}
              className="h-full w-full"
            />
          </div>
        </div>
      )}
    </>
  )
}
