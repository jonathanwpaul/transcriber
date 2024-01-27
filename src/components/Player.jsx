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
  const [isPlaying, setIsPlaying] = useState(false)
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
      controls: 0,
      fs: 0,
    },
  }

  let playerRef = useRef()

  const onReady = e => {
    playerRef.current = e.target
  }

  const onPlay = () => {
    playerRef.current.playVideo()
    setIsPlaying(true)
  }

  const onPause = () => {
    playerRef.current.pauseVideo()
    setIsPlaying(false)
  }

  const restartPlayer = () => {
    playerRef.current.seekTo(0)
  }

  const handleSliderChange = (_, newValue) => {
    playerRef.current.seekTo(newValue)
  }
  //   const handlePin = () => {}

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
      <div>
        <YouTube
          opts={videoOptions}
          videoId={videoId}
          onReady={onReady}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnd={() => setIsPlaying(false)}
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
          max={playerRef.current && playerRef.current.getDuration()}
        />
        <Slider
          size='small'
          value={[2, 5]}
        />
      </div>
    </Card>
    // </Draggable>
  )
}
