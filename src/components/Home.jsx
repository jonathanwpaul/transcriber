import { useEffect, useRef, useState } from 'react'
import {
  TextField,
  Button,
  Table,
  TableRow,
  TableHead,
  TableCell,
  Dialog,
  Tooltip,
  IconButton,
  Divider,
  Typography,
  Box,
} from '@mui/material'
import { Card } from './Card'
import { Stack } from './Stack'
import { VideoPlayer } from './VideoPlayer/VideoPlayer'
import { usePreferenceValue } from 'hooks/usePreferenceValue'
import { videoSources } from 'utils/constants'
import { Code } from '@mui/icons-material'

import { Filesystem, Directory } from '@capacitor/filesystem'
import FileUpload from './FileUpload'

export const Home = ({ showToast }) => {
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

  const handleFileChange = async e => {
    const file = e.target.files[0]

    if (file) {
      try {
        // Get the file path
        const filePath = file.path || file.name

        // Read the file content using Capacitor's Filesystem API
        const fileData = await Filesystem.readFile({
          path: filePath,
          directory: Directory.Documents, // Adjust the directory as needed
        })

        // Use the file path as the ID
        const id = filePath

        // Add the file to the videos object
        if (!videos[id]) {
          videos[id] = { type: videoSources.FILE, content: fileData.data }
        }

        // Show the video
        showVideoId(id)
      } catch (error) {
        console.error('Error reading file:', error)
        showToast('Failed to load the file. Please try again.')
      }
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
    videos[a]['last_accessed'] > videos[b]['last_accessed'] ? -1 : 1,
  )

  // if there's a cached entry and not one already selected, use that
  // if (videoList.length > 0 && !showVideoPlayer && !id) {
  //   setId(videoList[0])
  //   setShowVideoPlayer(true)
  // }

  return !showVideoPlayer ? (
    <Box sx={{ alignContent: 'center', height: '100%', padding: '10rem' }}>
      <Dialog
        open={showJSON}
        onClose={() => setShowJSON(false)}
        fullWidth
        maxWidth='md'
      >
        <Stack direction='column' padding='1rem' gap='1rem'>
          <TextField
            multiline
            fullWidth
            maxRows={20}
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
        </Stack>
      </Dialog>

      <Stack divider column gap='2rem' justifySelf='center'>
        <Card elevation={2}>
          <Stack
            divider
            alignItems='center'
            sx={{ '&::after': { content: '""' } }}
          >
            <Stack direction='column' gap='2rem' flex={3}>
              <Typography variant='h4' component='h2'>
                enter YouTube url
              </Typography>
              <Stack direction='row' gap='1rem'>
                <TextField
                  error={error}
                  fullWidth
                  helperText={error}
                  onChange={handleChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSubmit()
                  }}
                  placeholder='https://youtube.com/watch?v=...'
                  value={inputText}
                  variant='outlined'
                />
                <Button
                  disabled={!inputText}
                  onClick={handleSubmit}
                  sx={{ textTransform: 'none' }}
                  variant='contained'
                >
                  go
                </Button>
              </Stack>
            </Stack>
            <FileUpload accept='audio/*' stackProps={{ flex: 1 }} />
            <Stack alignItems='center' column gap='1rem'>
              <Tooltip title='show JSON'>
                <IconButton onClick={() => setShowJSON(true)}>
                  <Code />
                </IconButton>
              </Tooltip>
              <Typography textAlign='center' variant='body'>
                show code
              </Typography>
            </Stack>
          </Stack>
        </Card>
        {videos && videoList.length > 0 && (
          <Card sx={{ padding: 0 }}>
            <Table>
              <TableHead>
                <TableCell>
                  <Typography variant='h4' component='h2'>
                    Recents
                  </Typography>
                </TableCell>
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
                        }}
                        variant='text'
                        color='primary'
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
          </Card>
        )}
      </Stack>
    </Box>
  ) : (
    <VideoPlayer id={id} setShowVideoPlayer={setShowVideoPlayer} />
  )
}
