import { useState, useRef, useCallback } from 'react'
import { IconButton, Card, Slider, TextField, Button } from '@mui/material'
import { SkipPrevious, PlayArrow, PauseCircle } from '@mui/icons-material'
import YouTube from 'react-youtube'

export const VideoPlayer = ({ id }) => {
  const [url, setUrl] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [inputText, setInputText] = useState('')
  const [possiblePlaybackRates, setPossiblePlaybackRates] = useState([])
  const [sectionStart, setSectionStart] = useState(0)
  const [sectionEnd, setSectionEnd] = useState(0)

  const videoOptions = {
    width: 320,
    height: 195,
    playerVars: {
      controls: 1,
      fs: 1,
    },
  }

  const playerRef = useRef()
  const timerRef = useRef()
  const sectionEndRef = useRef()
  sectionEndRef.current = sectionEnd
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

  const timeIncrement = useCallback(() => {
    setCurrentTime(playerRef.current?.getCurrentTime())
    if (playerRef.current?.getCurrentTime() > sectionEndRef.current) {
      handleSliderChange(null, sectionStart)
    }
  }, [sectionStart])

  const onPlay = e => {
    setIsPlaying(true)
    timerRef.current = setInterval(
      timeIncrement,
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
    setCurrentTime(newValue)
    playerRef.current.seekTo(newValue)
  }

  const handleButtonClick = () => {
    setUrl(inputText)
  }

  const handlePlaybackRateChange = (_, newValue) => setPlaybackRate(newValue)

  const handleIntervalChange = (_, newValue) => {
    // forces the currentTime to match the sectionStart when the section parameters are updated
    if (newValue[0] !== sectionStart) {
      handleSliderChange(null, newValue[0])
      setSectionStart(newValue[0])
    }

    if (newValue[1] < currentTime) {
      handleSliderChange(null, newValue[0])
    }
    setSectionEnd(newValue[1])
  }

  return (
    <>
      <div>
        <YouTube
          opts={videoOptions}
          videoId={id}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
        />
      </div>
      <div className='vertical-container controls'>
        <div className='horizontal-container' style={{ alignItems: 'center' }}>
          <IconButton onClick={restartPlayer} aria-label='previous'>
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
              // position: 'absolute',
              top: '50%',
            }}
            sx={{
              '& .MuiSlider-thumb': {
                borderRadius: '50vw',
                width: 12,
                height: 30,
                transform: 'translate(-50%)',
              },
              '& .MuiSlider-track': {
                // borderTopLeftRadius: '50vh',
                // borderTopRightRadius: '50vh',
                opacity: 0.2,
                height: 10,
              },
              '.MuiSlider-rail': {
                height: 0,
              },
            }}
            value={[sectionStart, sectionEnd]}
            // valueLabelDisplay='on'
            valueLabelFormat={timestampFormatter}
          />
          {/* the playback slider (mirrors video playback slider) */}
          <Slider
            min={0}
            max={duration}
            onChange={handleSliderChange}
            size='small'
            step={0.1}
            style={
              {
                // position: 'relative',
              }
            }
            value={currentTime}
            // valueLabelDisplay='on'
            // valueLabelFormat={timestampFormatter}
          />
        </div>
      </div>
    </>
  )
}

const timestampFormatter = value =>
  new Date(value * 1000).toISOString().slice(11, 21)
