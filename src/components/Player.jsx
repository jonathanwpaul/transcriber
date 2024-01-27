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
    isPlaying: false,
    duration: 0,
    sectionStart: 0,
    sectionEnd: 0,
  })
  const { isPlaying, duration, sectionStart, sectionEnd } = playerStatus
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

  const onReady = e => {
    playerRef.current = e.target
    setPlayerStatus({
      ...playerStatus,
      duration: playerRef.current.getDuration(),
    })
  }

  const onPlay = () => {
    playerRef.current.playVideo()
    setPlayerStatus({ ...playerStatus, isPlaying: true })
  }

  const onPause = () => {
    playerRef.current.pauseVideo()
    setPlayerStatus({ ...playerStatus, isPlaying: false })
  }

  const restartPlayer = () => {
    playerRef.current.seekTo(0)
  }

  const handleSliderChange = (_, newValue) => {
    playerRef.current.seekTo(newValue)
  }
  //   const handlePin = () => {}

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
        <IconButton aria-label='previous'>
          <SkipPrevious onClick={restartPlayer} />
        </IconButton>
        <IconButton aria-label='play/pause'>
          {isPlaying ? (
            <PauseCircle
              sx={{ height: 38, width: 38 }}
              onClick={onPause}
            />
          ) : (
            <PlayArrow
              sx={{ height: 38, width: 38 }}
              onClick={onPlay}
            />
          )}
        </IconButton>
        <IconButton aria-label='next'>
          <SkipNext />
        </IconButton>
      </div>
      <div className='vertical-container'>
        <YouTube
          opts={videoOptions}
          videoId={videoId}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          on
          //   onEnd={() => setIsPlaying(false)}
        />
        <Slider
          size='small'
          step={0.1}
          value={playerRef.current && playerRef.current.getCurrentTime()}
          valueLabelDisplay='auto'
          onChange={handleSliderChange}
          valueLabelFormat={value =>
            new Date(value * 1000).toISOString().slice(11, 19)
          }
          min={0}
          max={duration}
        />
        <Slider
          size='small'
          step={0.1}
          min={0}
          max={duration}
          onChange={handleIntervalChange}
          value={[sectionStart, sectionEnd]}
        />
      </div>
    </Card>
    // </Draggable>
  )
}
