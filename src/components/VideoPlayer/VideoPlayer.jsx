import _ from 'lodash'
import { useState, useRef, useCallback } from 'react'
import {
  Card,
  IconButton,
  List,
  Slider,
  TextField,
  Tooltip,
  Snackbar,
} from '@mui/material'
import { TimeTextInput } from './components'
import {
  PauseCircle,
  RestartAlt,
  SkipPrevious,
  Flag,
  Save,
  Code,
  Close,
  PlayCircle,
  SkipNext,
} from '@mui/icons-material'
import YouTube from 'react-youtube'
import { usePreferenceValue } from '@hooks/usePreferenceValue'
import { timestampFormatter } from '@utils/timestampFormatter'
import SavedSection from './components/SavedSection'
import { Dialog } from './components/Dialog'
import { useTheme } from '@mui/material'
import BPMInput from './components/BPMInput' // Import the BPMInput component

export const VideoPlayer = ({ id, setShowVideoPlayer }) => {
  const theme = useTheme()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

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

  const {
    preference: appSettingsString,
    loading: appSettingsLoading,
    setValue: setAppSettings,
  } = usePreferenceValue({
    key: 'appSettings',
  })

  const appSettings = JSON.parse(appSettingsString) || {}
  const measures = appSettings['measures']
  const videos = JSON.parse(videosString) || {}

  const { beatsPerMeasure, bpm } = videos[id] || {}

  const videoOptions = {
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
   * @param {time}
   */
  const round = t => Math.round(t * 10) / 10

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

  const timeIncrement = useCallback(() => {
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

  const showToast = message => {
    setToastMessage(message)
    setToastOpen(true)
  }

  const handleCloseToast = () => {
    setToastOpen(false)
  }

  const saveLoop = () => {
    const key = `${sectionStart}-${sectionEnd}`
    videos[id].loops = videos[id].loops || {}
    videos[id].loops[key] = {
      ...(videos[id].loops[key] || {}), //for any other fields we want to save with loops
      sectionStart,
      sectionEnd,
    }
    setVideos('videos', videos)
  }

  const deleteLoop = loop => {
    videos[id].loops = _.omit(
      videos[id].loops,
      `${loop.sectionStart}-${loop.sectionEnd}`
    )
    setVideos('videos', videos)
  }

  const loadLoop = loop => {
    setSectionStart(loop['sectionStart'])
    setSectionEnd(loop['sectionEnd'])
    setCurrentTime(loop['sectionStart'])
    playerRef.current.seekTo(loop['sectionStart'])

    //TODO: make appsetting for playing on load of loop
    playerRef.current.playVideo()
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

  const renderLoop = (loop, i) => (
    <div className='vertical-container' key={`loop-${i}`} style={{ gap: 10 }}>
      <SavedSection
        endTime={loop.sectionEnd}
        isSelected={
          loop.sectionStart === sectionStart && loop.sectionEnd === sectionEnd
        }
        onClick={() => loadLoop(loop)}
        onDelete={() => deleteLoop(loop)}
        onTitleChange={title => {
          loop.title = title
          setVideos('videos', videos)
        }}
        startTime={loop.sectionStart}
        title={loop.title}
      />
    </div>
  )

  const handleBpmChange = newBpm => {
    videos[id].bpm = newBpm
    setVideos('videos', videos)
  }

  const handleBeatsPerMeasureChange = newBeatsPerMeasure => {
    videos[id].beatsPerMeasure = newBeatsPerMeasure
    setVideos('videos', videos)
  }

  const handleMeasuresChange = newMeasures => {
    setAppSettings('appSettings', { ...appSettings, measures: newMeasures })
  }

  if (loading || appSettingsLoading) return

  return (
    <div
      className='vertical-container'
      style={{ gap: 50, width: '100%', height: '100%' }}
    >
      <div
        className='horizontal-container'
        style={{
          flex: '0 0 30%',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <Tooltip title='Close video'>
          <IconButton
            style={{
              alignSelf: 'flex-start',
              backgroundColor: 'red',
              boxShadow: '2px 2px rgba(0, 0, 0, 0.4)', // Inset shadow for negative depth
              color: 'white',
              position: 'absolute',
              padding: 5,
              left: -15,
              top: -15,
            }}
            onClick={handleCloseVideo}
          >
            <Close />
          </IconButton>
        </Tooltip>

        <YouTube
          opts={videoOptions}
          videoId={id}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          style={{ aspectRatio: '16/9' }}
        />
        <div
          className='vertical-container'
          style={{
            justifyContent: 'space-around',
            padding: '0 20px',
          }}
        >
          <TimeTextInput
            value={sectionStart}
            onChange={value => setSectionStart(value)}
            changeAmount={0.5}
            label='start'
            min={0}
            max={duration}
          />
          <TimeTextInput
            value={currentTime}
            onChange={value => {
              setCurrentTime(value)
              playerRef.current.seekTo(value)
            }}
            label='current'
            changeAmount={0.5}
            min={0}
            max={duration}
          />
          <TimeTextInput
            value={sectionEnd}
            onChange={value => setSectionEnd(value)}
            changeAmount={0.5}
            label='end'
            min={0}
            max={duration}
          />
        </div>
        <div className='horizontal-container' style={{ alignItems: 'center' }}>
          <BPMInput
            value={bpm}
            onChange={handleBpmChange}
            beatsPerMeasure={beatsPerMeasure}
            onBeatsPerMeasureChange={handleBeatsPerMeasureChange}
          />
          <div className='vertical-container' style={{ alignItems: 'center' }}>
            <Tooltip title={`Previous ${measures} measures`}>
              <IconButton
                onClick={() => {
                  if (!bpm || !beatsPerMeasure) {
                    showToast(
                      'provide both BPM and beats/measure to use this function'
                    )
                    return
                  }
                  const newStart = Math.round(
                    sectionStart -
                      (measures * beatsPerMeasure) /*beats*/ /
                        (bpm /*beats/min*/ / 60) /*min/sec*/,
                    1
                  )
                  setSectionEnd(sectionStart)
                  setSectionStart(newStart)
                }}
              >
                <SkipPrevious />
              </IconButton>
            </Tooltip>
            <TextField
              type='number'
              label='measures'
              value={measures} // Add measures input
              onChange={e => handleMeasuresChange(parseInt(e.target.value, 10))}
              style={{ width: 120, marginTop: '10px' }}
            />
            <Tooltip title={`Next ${measures} measures`}>
              <IconButton
                onClick={() => {
                  if (!bpm || !beatsPerMeasure) {
                    showToast(
                      'provide both BPM and beats/measure to use this function'
                    )
                    return
                  }
                  const newEnd = Math.round(
                    sectionEnd +
                      (measures * beatsPerMeasure) /*beats*/ /
                        (bpm /*beats/min*/ / 60) /*min/sec*/,
                    1
                  )
                  setSectionStart(sectionEnd)
                  setSectionEnd(newEnd)
                }}
              >
                <SkipNext />
              </IconButton>
            </Tooltip>
          </div>

          <div
            className='horizontal-container'
            style={{
              alignItems: 'center',
              flex: '1 0 auto',
              justifyContent: 'space-around',
            }}
          >
            <Tooltip title='Restart player'>
              <IconButton onClick={restartPlayer}>
                <SkipPrevious />
              </IconButton>
            </Tooltip>
            <IconButton
              aria-label='play/pause'
              onClick={() =>
                isPlaying
                  ? playerRef.current?.pauseVideo()
                  : playerRef.current?.playVideo()
              }
              sx={{
                fontSize: '5rem',
              }}
            >
              {isPlaying ? (
                <PauseCircle
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: 'inherit',
                  }}
                />
              ) : (
                <PlayCircle
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: 'inherit',
                  }}
                />
              )}
            </IconButton>
            <Slider
              defaultValue={playbackRate}
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
                alignSelf: 'center',
              }}
              size='large'
              step={null}
              value={playbackRate}
              valueLabelFormat={val => val + 'x'}
              valueLabelDisplay='auto'
            />

            <div
              className='vertical-container'
              style={{ alignItems: 'center' }}
            >
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

              <Tooltip title='Save Loop'>
                <IconButton onClick={saveLoop}>
                  <Save />
                </IconButton>
              </Tooltip>

              <Tooltip title='Jump to loop start'>
                <IconButton onClick={restartLoop}>
                  <RestartAlt />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>

        <div
          className='vertical-container controls'
          style={{ flex: '1 0 50%', height: '50vh', gap: '30px' }}
        >
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

          {
            <Card
              style={{
                background: theme.palette.grey[200],
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                overflow: 'auto',
                height: '100%',

                boxShadow: 'inset 0 4px 4px rgba(0, 0, 0, 0.4)', // Inset shadow for negative depth
                borderRadius: '8px', // Optional, for rounded corners
                padding: '16px', // Padding for inner spacing
              }}
            >
              {videos[id].loops && Object.keys(videos[id].loops).length > 0 ? (
                <List
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                  }}
                >
                  {Object.values(videos[id].loops)
                    .sort((a, b) => a.sectionStart - b.sectionStart)
                    .map((loop, i) => renderLoop(loop, i))}
                </List>
              ) : (
                <p>Save a loop to see it here</p>
              )}
            </Card>
          }
          <Snackbar
            open={toastOpen}
            autoHideDuration={5000}
            onClose={handleCloseToast}
            message={toastMessage}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          />
        </div>
      </div>
    </div>
  )
}
