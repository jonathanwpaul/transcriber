import { useEffect, useState } from 'react'
import {
  Card,
  TextField,
  Button,
  ListItem,
  ListItemButton,
  List,
  Table,
  TableRow,
  TableHead,
  TableCell,
} from '@mui/material'
import { VideoPlayer } from './VideoPlayer'
import { usePreferenceValue } from 'hooks/usePreferenceValue'

const Player = () => {
  const [id, setId] = useState()
  const [showVideoPlayer, setShowVideoPlayer] = useState()
  const [inputText, setInputText] = useState()
  const [error, setError] = useState(false)
  const {
    preference: videosString,
    loading,
    setValue: setVideos,
  } = usePreferenceValue({
    key: 'videos',
  })

  const videos = JSON.parse(videosString) || {}
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
    if (!videos[id]) videos[id] = {}
    showVideoId(id)
  }

  const videoList = Object.keys(videos).sort((a, b) =>
    videos[a]['last_accessed'] > videos[b]['last_accessed'] ? -1 : 1
  )

  // if there's a cached entry and not one already selected, use that
  if (videoList.length > 0 && !showVideoPlayer && !id) {
    setId(videoList[0])
    setShowVideoPlayer(true)
  }
  console.log(videoList)

  return (
    <Card className='player'>
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
          ></TextField>
          <Button
            className='button'
            disabled={!inputText}
            onClick={handleSubmit}
            sx={{ textTransform: 'none' }}
            variant='contained'
          >
            Go
          </Button>
        </div>
      )}
      {!showVideoPlayer && videos && videoList.length > 0 && (
        <div className='vertical-container' style={{ alignSelf: 'center' }}>
          <Table>
            <TableHead>
              <TableCell>Previously Viewed</TableCell>
              <TableCell>Time</TableCell>
            </TableHead>
            {videoList.map(e => {
              return (
                <TableRow key={e} onClick={() => showVideoId(e)}>
                  <TableCell>
                    <Button variant='outlined' color='secondary'>
                      {e}
                    </Button>
                  </TableCell>
                  <TableCell>{videos[e]['last_accessed']}</TableCell>
                </TableRow>
              )
            })}
          </Table>
        </div>
      )}
      {showVideoPlayer && (
        <VideoPlayer id={id} setShowVideoPlayer={setShowVideoPlayer} />
      )}
    </Card>
  )
}

export default Player
