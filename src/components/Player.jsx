import { useEffect, useState, useRef } from 'react'
import { IconButton, Card, Slider } from '@mui/material'
import {
  SkipPrevious,
  PlayArrow,
  PauseCircle,
  SkipNext,
  //   DragIndicator,
  //   PushPin,
} from '@mui/icons-material'
// import Draggable from 'react-draggable'
import YouTube from 'react-youtube'

export const Player = () => {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=azphxfZc4_E')
  const [playerStatus, setPlayerStatus] = useState({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    playbackRate: 1,
    possiblePlaybackRates: [],
    sectionStart: 0,
    sectionEnd: 0,
  })

  const {
    currentTime,
    isPlaying,
    playbackRate,
    duration,
    sectionStart,
    sectionEnd,
  } = playerStatus

  const getId = url => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getId(url)

  const videoOptions = {
    width: 320,
    height: 195,
    playerVars: {
      controls: 1,
      fs: 1,
    },
  }

  let playerRef = useRef()
  let timerRef = useRef()
  /**
   * initializes the playerStatus when the youtube api is ready
   * @param {*} e the event from the youtube iframe
   */
  const onReady = e => {
    playerRef.current = e.target
    console.log('video ready')
    setPlayerStatus({
      currentTime: e.target.getCurrentTime(),
      duration: playerRef.current.getDuration(),
      isPlaying: e.target.getPlayerState() === 1,
      playbackRate: e.target.getPlaybackRate(),
      possiblePlaybackRates: e.target.getAvailablePlaybackRates(),
      sectionStart: 0,
      sectionEnd: e.target.getDuration(),
    })
  }

  const onPlay = e => {
    console.log('onPlay executing')
    timerRef.current = setInterval(
      () =>
        setPlayerStatus({
          ...playerStatus,
          isPlaying: true,
          currentTime: e.target.getCurrentTime(),
        }),
      100 //every 0.1s
    )
  }

  const onPause = () => {
    console.log('onPause executing')
    setPlayerStatus({ ...playerStatus, isPlaying: false })
    clearInterval(timerRef.current)
  }

  const restartPlayer = () => {
    handleSliderChange(null, 0)
  }

  const handleSliderChange = (_, newValue) => {
    playerRef.current.seekTo(newValue)
    setPlayerStatus({ ...playerStatus, currentTime: newValue })
  }

  const handlePlaybackRateChange = (_, newValue) => {
    playerRef.current.pauseVideo()
    playerRef.current.setPlaybackRate(newValue)
    setPlayerStatus({
      ...playerStatus,
      playbackRate: newValue,
    })
    playerRef.current.playVideo()
  }

  const handleIntervalChange = (_, newValue) => {
    setPlayerStatus({
      ...playerStatus,
      sectionStart: newValue[0],
      sectionEnd: newValue[1],
    })
  }
  return (
    // <Draggable
    //   id='#playback-menu'
    //   bounds='parent'
    //   handle='#handle'
    // >
    <Card className='player card'>
      {/* <div className='vertical-container'>
        <IconButton aria-label='move'>
          <PushPin onClick={handlePin} />
        </IconButton>
        <IconButton aria-label='move'>
          <DragIndicator id='handle' />
        </IconButton>
      </div> */}
      <div>
        <IconButton
          onClick={restartPlayer}
          aria-label='previous'
        >
          <SkipPrevious />
        </IconButton>
        <IconButton
          onClick={() =>
            isPlaying
              ? playerRef.current?.pauseVideo()
              : playerRef.current?.playVideo()
          }
          aria-label='play/pause'
        >
          {isPlaying ? (
            <PauseCircle sx={{ height: 38, width: 38 }} />
          ) : (
            <PlayArrow sx={{ height: 38, width: 38 }} />
          )}
        </IconButton>
      </div>
      <div className='vertical-container'>
        <YouTube
          opts={videoOptions}
          videoId={videoId}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          onPlaybackRateChange={
            e => console.log(e.data)
            // setPlayerStatus({ ...playerStatus, playbackRate: e.data })
          }
          //   onEnd={() => setIsPlaying(false)}
        />
        <Slider
          value={currentTime}
          valueLabelDisplay='on'
          valueLabelFormat={timestampFormatter}
          min={0}
          max={duration}
          onChange={handleSliderChange}
          size='small'
          step={0.1}
        />
        <Slider
          min={0}
          max={duration}
          onChange={handleIntervalChange}
          size='small'
          step={0.1}
          value={[sectionStart, sectionEnd]}
          valueLabelDisplay='on'
          valueLabelFormat={timestampFormatter}
        />
        <Slider
          default={1}
          min={0.1}
          max={2}
          marks
          onChange={handlePlaybackRateChange}
          size='small'
          step={0.1}
          value={playbackRate}
          valueLabelDisplay='on'
        />
      </div>
    </Card>
    // </Draggable>
  )
}

const timestampFormatter = value =>
  new Date(value * 1000).toISOString().slice(11, 21)
