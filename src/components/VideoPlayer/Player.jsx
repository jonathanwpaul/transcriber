import { useEffect, useRef, useState } from 'react'
import {
  TextField,
  Button,
  Table,
  TableRow,
  TableHead,
  TableCell,
  Dialog,
  Card,
  Tooltip,
  IconButton,
} from '@mui/material'
import { VideoPlayer } from './VideoPlayer'
import { usePreferenceValue } from 'hooks/usePreferenceValue'
import { videoSources } from 'utils/constants'
import { Code, UploadFile } from '@mui/icons-material'

const Player = ({ showToast }) => {
  const [id, setId] = useState()
  const [showVideoPlayer, setShowVideoPlayer] = useState()
  const [inputText, setInputText] = useState()
  const [error, setError] = useState(false)
  const [file, setFile] = useState(null)
  const {
    preference: videosString,
    loading,
    setValue: setVideos,
  } = usePreferenceValue({
    key: 'videos',
  })
  const videos = JSON.parse(videosString) || {}
  const [showJSON, setShowJSON] = useState(false)
  const [JSONText, setJSONText] = useState(videosString)
  const JSONInputRef = useRef()

  // useEffect(() => {
  //   if (id) {

  //   }
  // }, [id])

  useEffect(() => {
    setJSONText(JSON.stringify(videos, null, 2))
  }, [videosString])

  if (loading) return

  const getId = url => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = match && match[2].length === 11 ? match[2] : null
    videoId ? setError(null) : setError('invalid URL')

    return videoId
  }

  const handleChange = e => {
    setInputText(e.target.value)
    setError(null)
  }

  const handleFileChange = e => {
    const file = e.target.files[0]

    if (file) {
      setFile(file)
      const id = URL.createObjectURL(file)
      if (!videos[id]) videos[id] = { type: videoSources.FILE }
      showVideoId(id)
    }
  }

  const handleFileDrop = e => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setFile(file)
      const id = URL.createObjectURL(file)
      if (!videos[id]) videos[id] = { type: videoSources.FILE }
      showVideoId(id)
    }
  }

  const showVideoId = id => {
    videos[id].last_accessed = new Date()
    setVideos('videos', videos).then(() => {
      setId(id)
      setShowVideoPlayer(true)
    })
  }

  const handleSubmit = () => {
    const id = getId(inputText)
    if (!id) return
    if (!videos[id]) videos[id] = { type: videoSources.YOUTUBE }
    showVideoId(id)
  }

  const formatTimeString = timeString => new Date(timeString).toLocaleString()

  const videoList = Object.keys(videos).sort((a, b) =>
    videos[a]['last_accessed'] > videos[b]['last_accessed'] ? -1 : 1
  )

  // if there's a cached entry and not one already selected, use that
  // if (videoList.length > 0 && !showVideoPlayer && !id) {
  //   setId(videoList[0])
  //   setShowVideoPlayer(true)
  // }

  return (
    <div className='player'>
      <Dialog
        open={showJSON}
        onClose={() => setShowJSON(false)}
        fullWidth
        maxWidth='md'
      >
        <Card
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <TextField
            multiline
            fullWidth
            value={JSONText}
            onChange={e => {
              setJSONText(e.target.value)
            }}
            ref={JSONInputRef}
          />
          <Button
            className='button'
            onClick={() => {
              if (!JSON.parse(JSONText)) {
                showToast('Invalid JSON')
              } else {
                setVideos('videos', JSON.parse(JSONText))
                setShowJSON(false)
              }
            }}
            variant='contained'
            style={{ alignSelf: 'flex-end', textTransform: 'none' }}
          >
            Update
          </Button>
        </Card>
      </Dialog>

      {!showVideoPlayer && (
        <div className='horizontal-container' style={{ alignSelf: 'center' }}>
          <TextField
            error={error}
            fullWidth
            helperText={error}
            onChange={handleChange}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSubmit()
            }}
            placeholder='YouTube URL'
            value={inputText}
            variant='outlined'
          />
          <Button
            disabled={!inputText}
            onClick={handleSubmit}
            sx={{ textTransform: 'none' }}
            variant='contained'
          >
            Go
          </Button>
          <input
            accept='video/*, audio/*'
            id='file-input'
            type='file'
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor='file-input'>
            <Tooltip title='Upload video file'>
              <IconButton component='span'>
                <UploadFile />
              </IconButton>
            </Tooltip>
          </label>
        </div>
      )}
      {!showVideoPlayer && videos && videoList.length > 0 && (
        <div
          className='vertical-container'
          style={{ alignSelf: 'center', width: '100%' }}
        >
          <Tooltip title='Show JSON' style={{ alignSelf: 'flex-end' }}>
            <IconButton onClick={() => setShowJSON(true)}>
              <Code />
            </IconButton>
          </Tooltip>

          <Table>
            <TableHead>
              <TableCell>Previously Viewed</TableCell>
              <TableCell></TableCell>
            </TableHead>
            {videoList.map(e => {
              return (
                <TableRow key={e}>
                  <TableCell>
                    <Button
                      onClick={() => showVideoId(e)}
                      sx={{
                        justifyContent: 'start',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        maxWidth: '500px',
                      }}
                      variant='text'
                      color='secondary'
                    >
                      {videos[e].title ?? e}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {formatTimeString(videos[e]['last_accessed'])}
                  </TableCell>
                </TableRow>
              )
            })}
          </Table>
        </div>
      )}
      {showVideoPlayer && (
        <VideoPlayer id={id} setShowVideoPlayer={setShowVideoPlayer} />
      )}
    </div>
  )
}

export default Player
