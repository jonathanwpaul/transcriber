import { useState, useRef, useCallback } from 'react'
import {
  IconButton,
  Card,
  Slider,
  TextField,
  Button,
  Tooltip,
} from '@mui/material'
import {
  SkipPrevious,
  PlayArrow,
  PauseCircle,
  StartOutlined,
  RestartAlt,
  Close,
  CloseOutlined,
  CancelOutlined,
} from '@mui/icons-material'
import YouTube from 'react-youtube'

export const VideoPlayer = ({ id, setId }) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [possiblePlaybackRates, setPossiblePlaybackRates] = useState([])
  const [sectionStart, setSectionStart] = useState(0)
  const [sectionEnd, setSectionEnd] = useState(0)

  const videoOptions = {
    // width: 320,
    // height: 195,
    playerVars: {
      controls: 1,
      fs: 1,
    },
  }

  const playerRef = useRef()
  const timerRef = useRef()
  const sectionStartRef = useRef()
  const sectionEndRef = useRef()
  sectionStartRef.current = sectionStart
  sectionEndRef.current = sectionEnd
  /**
   * initializes the playerStatus when the youtube api is ready
   * @param {*} e the event from the youtube iframe
   */
  const onReady = e => {
    playerRef.current = e.target
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
      handleSliderChange(null, sectionStartRef.current)
    }
  }, [])

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

  const handlePlaybackRateChange = (_, newValue) => {
    setPlaybackRate(newValue)
    playerRef.current.setPlaybackRate(newValue)
  }

  const handleIntervalChange = (_, newValue) => {
    if (newValue[0] > currentTime) {
      handleSliderChange(null, newValue[0])
    }
    setSectionStart(newValue[0])

    if (newValue[1] < currentTime) {
      handleSliderChange(null, newValue[1])
    }
    setSectionEnd(newValue[1])
  }

  const preventHorizontalKeyboardNavigation = event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
    }
  }

  const handleCloseVideo = () => {
    playerRef.current = null
    setId(null)
  }

  const markLoopStart = () => {
    setSectionStart(currentTime)
  }

  const markLoopEnd = () => {
    setSectionEnd(currentTime)
  }
  return (
    <>
      <div className='horizontal-container' style={{ gap: '50px' }}>
        <YouTube
          opts={videoOptions}
          videoId={id}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
        />

        <Slider
          defaultValue={playbackRate}
          orientation='vertical'
          onKeyDown={preventHorizontalKeyboardNavigation}
          sx={{
            '& input[type="range"]': {
              WebkitAppearance: 'slider-vertical',
            },
          }}
          onChange={handlePlaybackRateChange}
          size='small'
          min={playerRef.current?.getAvailablePlaybackRates()[0]}
          step={0.05}
          max={2}
          value={playbackRate}
          valueLabelFormat={val => val + 'x'}
          valueLabelDisplay='on'
        />
      </div>
      <div className='vertical-container controls'>
        <div className='horizontal-container' style={{ alignItems: 'center' }}>
          <Tooltip title='Close video'>
            <IconButton
              style={{ alignSelf: 'center' }}
              onClick={handleCloseVideo}
            >
              <CancelOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title='Jump to beginning'>
            <IconButton onClick={restartPlayer} aria-label='previous'>
              <RestartAlt />
            </IconButton>
          </Tooltip>
          <Tooltip title='Mark loop start'>
            <IconButton onClick={markLoopStart}>
              <StartOutlined />
            </IconButton>
          </Tooltip>
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
          <Tooltip title='Mark loop end'>
            <IconButton onClick={markLoopEnd}>
              <StartOutlined sx={{ transform: 'rotate(180deg)' }} />
            </IconButton>
          </Tooltip>
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
                '&[data-index="0"]': {
                  color: 'green',
                },

                '&[data-index="1"]': {
                  color: 'red',
                },
                /* Border */
                borderRadius: '0px 50% 50% 50%',

                /* Angle at the top */
                transform: 'translateX(-50%) translateY(-200%) rotate(225deg)',

                /* Size */
                height: '1rem',
                width: '1rem',
              },
              '& .MuiSlider-track': {
                // borderTopLeftRadius: '50vh',
                // borderTopRightRadius: '50vh',
                borderRadius: '5px',
                opacity: 0.1,
                height: 20,
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
