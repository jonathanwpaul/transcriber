import _ from 'lodash'
import { useState, useRef, useCallback } from 'react'
import {
  IconButton,
  List,
  Slider,
  Tooltip,
} from '@mui/material'
import { TimeTextInput } from './components'
import {
  PlayArrow,
  PauseCircle,
  RestartAlt,
  CancelOutlined,
  SkipPrevious,
  Flag,
  Save,
} from '@mui/icons-material'
import YouTube from 'react-youtube'
import { usePreferenceValue } from '@hooks/usePreferenceValue'
import { timestampFormatter } from '@utils/timestampFormatter'
import SavedSection from './components/SavedSection'

export const VideoPlayer = ({ id, setShowVideoPlayer }) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  //TODO: see if we can use possibleplaybackrates instead
  const [possiblePlaybackRates, setPossiblePlaybackRates] = useState([])
  const [sectionStart, setSectionStart] = useState(0)
  const [sectionEnd, setSectionEnd] = useState(0)
  const {
    preference: videosString,
    loading,
    setValue: setVideos,
  } = usePreferenceValue({
    key: 'videos',
  })

  const videos = JSON.parse(videosString) || {}

  const videoOptions = {
    playerVars: {
      controls: 1,
      fs: 1,
    },
  }

  console.log(videos)

  const playerRef = useRef()
  const timerRef = useRef()
  const sectionStartRef = useRef()
  const sectionEndRef = useRef()
  sectionStartRef.current = sectionStart
  sectionEndRef.current = sectionEnd

  /**
   * @param {time}
   */
  const round = t => Math.round(t * 10) / 10

  /**
   * initializes the playerStatus when the youtube api is ready
   * @param {*} e the event from the youtube iframe
   */
  const onReady = e => {
    playerRef.current = e.target
    setCurrentTime(round(e.target.getCurrentTime()))
    setDuration(playerRef.current.getDuration())
    setIsPlaying(e.target.getPlayerState() === 1)
    setPlaybackRate(e.target.getPlaybackRate())
    setPossiblePlaybackRates(e.target.getAvailablePlaybackRates())
    setSectionStart(0)
    setSectionEnd(e.target.getDuration())
  }

  const timeIncrement = useCallback(() => {
    // console.log({
    //   time: playerRef.current.getCurrentTime(),
    //   start: sectionStartRef.current,
    //   end: sectionEndRef.current,
    // })
    setCurrentTime(round(playerRef.current?.getCurrentTime()))
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
    setCurrentTime(round(newValue))
    playerRef.current.seekTo(round(newValue))
  }

  const handlePlaybackRateChange = (_, newValue) => {
    setPlaybackRate(newValue)
    playerRef.current.setPlaybackRate(newValue)
  }

  const handleIntervalChange = (_, newValue, activeThumb) => {
    const minTime = 1
    if (activeThumb === 0) {
      if (newValue[0] > currentTime) {
        handleSliderChange(null, newValue[0])
      }
      setSectionStart(round(Math.min(newValue[0], sectionEnd - minTime)))
    } else {
      if (newValue[1] < currentTime) {
        handleSliderChange(null, newValue[1])
      }
      setSectionEnd(round(Math.max(newValue[1], sectionStart + minTime)))
    }
  }

  const preventHorizontalKeyboardNavigation = event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
    }
  }

  const handleCloseVideo = () => {
    playerRef.current = null
    setShowVideoPlayer(false)
  }

  const saveLoop = () => {
    const arr = videos[id].loops || []
    arr.map(e => [e.sectionStart, e.sectionEnd])
    arr.push({ sectionStart, sectionEnd })
    videos[id].loops = Array.from(_.uniqWith(arr, _.isEqual))
    setVideos('videos', videos)
  }

  const deleteLoop = (loop) => {
    const arr = videos[id].loops || []
    const idx = arr.indexOf(loop)
    arr.splice(idx, 1)
    videos[id].loops = arr
    setVideos('videos', videos)
  }

  const loadLoop = loop => {
    setSectionStart(loop['sectionStart'])
    setSectionEnd(loop['sectionEnd'])
  }
  const markLoopStart = () => {
    setSectionStart(round(currentTime))
  }

  const markLoopEnd = () => {
    setSectionEnd(round(currentTime))
  }

  const restartLoop = () => {
    setCurrentTime(sectionStart)
    playerRef.current.seekTo(sectionStart)
  }
  if (loading) return

  return (
    <div className='vertical-container' style={{ gap: 50, width: '100%' }}>
      <div className='horizontal-container' style={{ flex: '1 0 1' }}>
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
          style={{ alignSelf: 'center', width: '100%', height: '100%' }}
        // style={{ position: 'fixed' }}
        />
      </div>
      <div
        className='horizontal-container'
        style={{ alignContent: 'center', flex: '2 0 2' }}
      >
        <Slider
          defaultValue={playbackRate}
          // min={playerRef.current?.getAvailablePlaybackRates()[0]}
          max={2}
          marks={[
            { value: 0.125 },
            { value: 0.25 },
            { value: 0.5 },
            { value: 1 },
            { value: 1.5 },
            { value: 2 },
          ]}
          onChange={handlePlaybackRateChange}
          onKeyDown={preventHorizontalKeyboardNavigation}
          orientation='vertical'
          sx={{
            '& input[type="range"]': {
              WebkitAppearance: 'slider-vertical',
            },
            alignSelf: 'center',
          }}
          size='large'
          step={null}
          value={playbackRate}
          valueLabelFormat={val => val + 'x'}
          valueLabelDisplay='auto'
        />

        <div className='vertical-container controls' style={{ flex: 1 }}>
          <div>
            {/* the loop slider */}
            <Slider
              color='secondary'
              disableSwap
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
                    transform: 'translateX(-50%) translateY(-150%)', //rotate(-135deg)',
                  },

                  '&[data-index="1"]': {
                    color: 'red',
                    transform: 'translateX(-50%) translateY(-150%)', //rotate(-135deg)',
                  },
                  /* Border */
                  // borderRadius: '0px 50% 50% 50%',

                  /* Size */
                  height: '2rem',
                  width: '2rem',
                },
                '& .MuiSlider-track': {
                  boxSizing: 'border-box',
                  borderRadius: '5px',
                  borderLeft: '5px solid green',
                  borderRight: '5px solid red',
                  color: '#eeeeee95',
                  opacity: 0.8,
                  height: 30,
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
              value={currentTime}
              valueLabelDisplay='auto'
              valueLabelFormat={timestampFormatter}
            />
          </div>
          <div className='horizontal-container'>
            <Tooltip title='Mark loop start'>
              <IconButton onClick={markLoopStart}>
                <Flag sx={{ color: 'green' }} />
              </IconButton>
            </Tooltip>
            <TimeTextInput
              value={sectionStart}
              onChange={value => setSectionStart(value)}
              changeAmount={0.5}
              min={0}
              max={duration}
            />
            <TimeTextInput
              value={currentTime}
              onChange={value => {
                setCurrentTime(value)
                playerRef.current.seekTo(value)
              }}
              changeAmount={0.5}
              min={0}
              max={duration}
            />
            <Tooltip title='Mark loop end'>
              <IconButton onClick={markLoopEnd}>
                <Flag sx={{ color: 'red' }} />
              </IconButton>
            </Tooltip>
            <TimeTextInput
              value={sectionEnd}
              onChange={value => setSectionEnd(value)}
              changeAmount={0.5}
              min={0}
              max={duration}
            />
          </div>

          <div
            className='horizontal-container'
            style={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Tooltip title='Save Loop'>
              <IconButton onClick={saveLoop}>
                <Save />
              </IconButton>
            </Tooltip>
            <Tooltip title='Restart player'>
              <IconButton onClick={restartPlayer}>
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
          </div>
          {videos[id].loops && (
            <List>
              {videos[id].loops.map(loop => (
                <SavedSection
                  onClick={() => loadLoop(loop)}
                  onDelete={() => deleteLoop(loop)}
                  startTime={loop.sectionStart}
                  endTime={loop.sectionEnd}
                />
              ))}
            </List>
          )}
        </div>
      </div>
    </div>
  )
}
