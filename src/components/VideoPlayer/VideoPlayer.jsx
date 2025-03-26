import _ from 'lodash'
import { useState, useRef, useCallback } from 'react'
import {
  Card,
  IconButton,
  List,
  Slider,
  TextField,
  Tooltip,
} from '@mui/material'
import { TimeTextInput } from './components'
import {
  PauseCircle,
  RestartAlt,
  SkipPrevious,
  Flag,
  Save,
  Close,
  PlayCircle,
  SkipNext,
} from '@mui/icons-material'
import { usePreferenceValue } from '@hooks/usePreferenceValue'
import { timestampFormatter, round } from '@utils/video'
import SavedSection from './components/SavedSection'
import { useTheme } from '@mui/material'
import BPMInput from './components/BPMInput' // Import the BPMInput component
import { YouTubeSource } from './components/YouTubeSource'
import { Header } from './components/Header'

export const VideoPlayer = ({ id, setShowVideoPlayer, showToast, type }) => {
  const theme = useTheme()
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

  const {
    preference: appSettingsString,
    loading: appSettingsLoading,
    setValue: setAppSettings,
  } = usePreferenceValue({
    key: 'appSettings',
  })

  const appSettings = JSON.parse(appSettingsString) || { measures: 4, useSelectedAsParent: true }
  const measures = appSettings['measures']
  const videos = JSON.parse(videosString) || {}

  const { beatsPerMeasure, bpm } = videos[id] || {}

  const playerRef = useRef()
  const timerRef = useRef()
  const sectionStartRef = useRef()
  const sectionEndRef = useRef()
  sectionStartRef.current = sectionStart
  sectionEndRef.current = sectionEnd

  //TODO: disable controls while waiting
  const controlsDisabled = playerRef.current === null

  const timeIncrement = useCallback(() => {
    setCurrentTime(round(playerRef.current?.getCurrentTime()))
    if (playerRef.current?.getCurrentTime() > sectionEndRef.current) {
      handleSeek(null, sectionStartRef.current)
    }
  }, [])

  const handlePlay = e => {
    setIsPlaying(true)
    timerRef.current = setInterval(
      timeIncrement,
      100 //every 0.1s
    )
    playerRef.current.play()
  }

  const handlePause = () => {
    clearInterval(timerRef.current)
    setIsPlaying(false)
    playerRef.current.pause()
  }

  /**
   * moves the slider to the start
   */
  const restartPlayer = () => {
    handleSeek(null, 0)
  }

  const handleSeek = (_, newValue) => {
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
        handleSeek(null, newValue[0])
      }
      setSectionStart(round(Math.min(newValue[0], sectionEnd - minTime)))
    } else {
      if (newValue[1] < currentTime) {
        handleSeek(null, newValue[1])
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

  /**
   * this calculates the path of a given loop using the start and end times. 
   */
  const calculatePath = (loops, loop, path = '') => {
    const getLoopDistance = k =>
      loop.sectionStart -
      loops[k].sectionStart +
      loops[k].sectionEnd -
      loop.sectionEnd
    const parentKeys = Object.keys(loops)
      .filter(
        k =>
          loops[k].sectionStart <= loop.sectionStart &&
          loops[k].sectionEnd >= loop.sectionEnd
      )
      .sort((a, b) => getLoopDistance(a) - getLoopDistance(b))

    if (parentKeys.length === 0) {
      return path + `${loop.sectionStart}-${loop.sectionEnd}`
    }
    return calculatePath(
      loops[parentKeys[0]]?.children || {},
      loop,
      path + parentKeys[0] + '/children/'
    )
  }

  const saveLoop = () => {
    const key = `${sectionStart}-${sectionEnd}`
    videos[id].loops = videos[id].loops || {}

    //find the path that this loop belongs into (nesting)
    const path = calculatePath(videos[id].loops, {
      sectionStart,
      sectionEnd,
    })

    _.set(videos[id].loops, path.split('/'), {
      ...(videos[id].loops[key] || {}), //for any other fields we want to save with loops
      sectionStart,
      sectionEnd,
    })
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

  const renderLoop = (loop, i) => {
    return (
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
        <div style={{ paddingLeft: 20 }}>
          {loop.children &&
            Object.values(loop.children).map((child, j) =>
              renderLoop(child, `${i}-${j}`)
            )}
        </div>
      </div>
    )
  }

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
    <Header title={videos[id].title || id}/>
      <div
        className='vertical-container controls'
        style={{ flex: '1 0 50%', height: '50vh', gap: '30px' }}
      >
        {
          <Card
            style={{
              background: theme.palette.grey[200],
              borderRadius: '8px', // Optional, for rounded corners
              boxShadow: 'inset 0 4px 4px rgba(0, 0, 0, 0.4)', // Inset shadow for negative depth
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              height: '100%',
              overflow: 'auto',
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
      </div>

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
            disabled={controlsDisabled}
            onClick={handleCloseVideo}
            style={{
              alignSelf: 'flex-start',
              backgroundColor: 'red',
              boxShadow: '2px 2px rgba(0, 0, 0, 0.4)', // Inset shadow for negative depth
              color: 'white',
              left: -15,
              padding: 5,
              position: 'absolute',
              top: -15,
            }}
          >
            <Close />
          </IconButton>
        </Tooltip>
        <Card
          className='horizontal-container'
          style={{ flexWrap: 'wrap', padding: 20 }}
        >
          <YouTubeSource
            id={id}
            onPause={handlePause}
            onPlay={handlePlay}
            playerRef={playerRef}
            setCurrentTime={setCurrentTime}
            setDuration={setDuration}
            setIsPlaying={setIsPlaying}
            setPlaybackRate={setPlaybackRate}
            setPossiblePlaybackRates={setPossiblePlaybackRates}
            setSectionEnd={setSectionEnd}
            setSectionStart={setSectionStart}
            setVideos={setVideos}
            videos={videos}
          />
          <div
            className='vertical-container'
            style={{
              justifyContent: 'space-around',
            }}
          >
            <TimeTextInput
              onChange={value => setSectionStart(value)}
              changeAmount={0.5}
              disabled={controlsDisabled}
              label='start'
              min={0}
              max={duration}
              value={sectionStart}
            />
            <TimeTextInput
              value={currentTime}
              disabled={controlsDisabled}
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
              disabled={controlsDisabled}
              onChange={value => setSectionEnd(value)}
              changeAmount={0.5}
              label='end'
              min={0}
              max={duration}
            />
          </div>
        </Card>
        <Card
          className='vertical-container'
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <BPMInput
            value={bpm}
            onChange={handleBpmChange}
            beatsPerMeasure={beatsPerMeasure || 4}
            onBeatsPerMeasureChange={handleBeatsPerMeasureChange}
          />
          <div
            className='horizontal-container'
            style={{ alignItems: 'center' }}
          >
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
                        (bpm /*beats/min*/ / 60) /*min/sec*/
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
                        (bpm /*beats/min*/ / 60) /*min/sec*/
                  )
                  setSectionStart(sectionEnd)
                  setSectionEnd(newEnd)
                }}
              >
                <SkipNext />
              </IconButton>
            </Tooltip>
          </div>
        </Card>

        <Card
          className='horizontal-container'
          style={{
            alignItems: 'center',
            // flex: '1 0 auto',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            padding: 20,
          }}
        >
          <Tooltip title='Restart player'>
            <IconButton onClick={restartPlayer}>
              <SkipPrevious />
            </IconButton>
          </Tooltip>
          <IconButton
            aria-label='play/pause'
            onClick={isPlaying ? handlePause : handlePlay}
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
          <div className='vertical-container' style={{ alignItems: 'center' }}>
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
        </Card>
      </div>

      {/* the loop slider */}
      <div>
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
          onChange={handleSeek}
          size='large'
          step={0.1}
          value={currentTime}
          valueLabelDisplay='auto'
          valueLabelFormat={timestampFormatter}
        />
      </div>
    </div>
  )
}
