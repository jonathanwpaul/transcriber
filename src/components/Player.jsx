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
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [possiblePlaybackRates, setPossiblePlaybackRates] = useState([])
  const [sectionStart, setSectionStart] = useState(0)
  const [sectionEnd, setSectionEnd] = useState(0)

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
    setCurrentTime(e.target.getCurrentTime())
    setDuration(playerRef.current.getDuration())
    setIsPlaying(e.target.getPlayerState() === 1)
    setPlaybackRate(e.target.getPlaybackRate())
    setPossiblePlaybackRates(e.target.getAvailablePlaybackRates())
    setSectionStart(0)
    setSectionEnd(e.target.getDuration())
  }

  const onPlay = e => {
    timerRef.current = setInterval(
      () => {
        const playerTime = e.target.getCurrentTime()
        // TODO: if the loop end time is moved before the current time while it's playing, the interval function doesn't get the new section limit value, so it won't loop until the video is paused &played again
        const reachedLoopEnd = playerTime >= sectionEnd

        const beforeLoopStart = playerTime < sectionStart
        if (reachedLoopEnd || beforeLoopStart) {
          handleSliderChange(null, sectionStart)
        } else {
          setIsPlaying(true)
          setCurrentTime(playerTime)
        }
      },
      100 //every 0.1s
    )
  }

  const onPause = () => {
    clearInterval(timerRef.current)
    setIsPlaying(false)
  }

  const restartPlayer = () => {
    handleSliderChange(null, 0)
  }

  const handleSliderChange = (_, newValue) => {
    clearInterval(timerRef.current)
    playerRef.current.seekTo(newValue)
    setCurrentTime(newValue)
  }

  const handlePlaybackRateChange = (_, newValue) => setPlaybackRate(newValue)

  const handleIntervalChange = (_, newValue) => {
    setSectionStart(newValue[0])
    setSectionEnd(newValue[1])
  }

  return (
    <Card
      elevation={5}
      className='player card'
    >
      <div>
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
      </div>
      <div
        className='vertical-container'
        style={{ maxWidth: '60%' }}
      >
        <div className='horizontal-container'>
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
        <div style={{ position: 'relative' }}>
          {/* the loop slider */}
          <Slider
            color='secondary'
            min={0}
            max={duration}
            onChange={handleIntervalChange}
            size='small'
            step={0.1}
            style={{
              position: 'absolute',
            }}
            sx={{
              '& .MuiSlider-thumb': {
                borderRadius: '50vw',
                width: 8,
                height: 40,
                transform: 'translate(-50%, -100%)',
              },
              '& .MuiSlider-track': {
                transform: 'translate(0, -40px)',
              },
            }}
            value={[sectionStart, sectionEnd]}
            valueLabelDisplay='on'
            valueLabelFormat={timestampFormatter}
          />
          {/* the playback slider (mirrors video playback slider) */}
          <Slider
            min={0}
            max={duration}
            onChange={handleSliderChange}
            size='small'
            step={0.1}
            style={{
              position: 'relative',
            }}
            value={currentTime}
            valueLabelDisplay='on'
            valueLabelFormat={timestampFormatter}
          />
        </div>
      </div>
    </Card>
  )
}

const timestampFormatter = value =>
  new Date(value * 1000).toISOString().slice(11, 21)
