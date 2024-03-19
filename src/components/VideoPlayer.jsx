import { useState, useRef, useCallback } from 'react'
import { IconButton, Slider, Tooltip } from '@mui/material'
import {
  PlayArrow,
  PauseCircle,
  StartOutlined,
  RestartAlt,
  CancelOutlined,
  SkipPrevious,
  Flag,
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

  const restartLoop = () => {
    setCurrentTime(sectionStart)
    playerRef.current.seekTo(sectionStart)
  }

  return (
    <div className='horizontal-container' style={{ gap: 50, width: '100%' }}>
      <div className='horizontal-container'>
        <Tooltip title='Close video'>
          <IconButton
            style={{
              alignSelf: 'flex-start',
              backgroundColor: 'red',
              color: 'white',
              // position: 'relative',
              padding: 5,
              // left: '-5',
            }}
            onClick={handleCloseVideo}
          >
            <CancelOutlined />
          </IconButton>
        </Tooltip>
        <YouTube
          opts={videoOptions}
          videoId={id}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          // style={{ position: 'fixed' }}
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
          size='large'
          min={playerRef.current?.getAvailablePlaybackRates()[0]}
          step={0.05}
          max={2}
          value={playbackRate}
          valueLabelFormat={val => val + 'x'}
          valueLabelDisplay='auto'
        />
      </div>
      <div className='vertical-container controls' style={{ flex: 3 }}>
        <div>
          {/* the loop slider */}
          <Slider
            color='secondary'
            min={0}
            max={duration}
            onChange={handleIntervalChange}
            size='large'
            step={0.1}
            style={{
              top: '50%',
              // position: 'absolute',
            }}
            sx={{
              '& .MuiSlider-thumb': {
                '&[data-index="0"]': {
                  color: 'green',
                  transform: 'translateX(-50%) translateY(-150%)', // rotate(225deg)',
                },

                '&[data-index="1"]': {
                  color: 'red',
                  transform: 'translateX(-50%) translateY(50%)', // rotate(45deg)',
                },
                /* Border */
                // borderRadius: '0px 50% 50% 50%',

                /* Size */
                height: '2rem',
                width: '2rem',
              },
              '& .MuiSlider-track': {
                borderRadius: '5px',
                opacity: 0.1,
                height: 20,
              },
              '.MuiSlider-rail': {
                height: 0,
              },
            }}
            value={[sectionStart, sectionEnd]}
            valueLabelDisplay='auto'
            valueLabelFormat={timestampFormatter}
          />
          {/* the playback slider (mirrors video playback slider) */}
          <Slider
            min={0}
            max={duration}
            onChange={handleSliderChange}
            size='large'
            step={0.1}
            style={
              {
                // position: 'absolute',
              }
            }
            value={currentTime}
            valueLabelDisplay='auto'
            valueLabelFormat={timestampFormatter}
          />
        </div>
        <div className='horizontal-container' style={{ alignItems: 'center' }}>
          <Tooltip title='Restart player'>
            <IconButton onClick={restartLoop}>
              <SkipPrevious />
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
            {isPlaying ? <PauseCircle /> : <PlayArrow />}
          </IconButton>
          <Tooltip title='Jump to loop start'>
            <IconButton onClick={restartLoop}>
              <RestartAlt />
            </IconButton>
          </Tooltip>
          <Tooltip title='Mark loop start'>
            <IconButton onClick={markLoopStart}>
              <Flag sx={{ color: 'green' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Mark loop end'>
            <IconButton onClick={markLoopEnd}>
              <Flag sx={{ color: 'red' }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

const timestampFormatter = value =>
  new Date(value * 1000).toISOString().slice(11, 21)
