import { useEffect, useState } from 'react'
import {
  Card,
  TextField,
  Button,
  ListItem,
  ListItemButton,
  List,
} from '@mui/material'
import { VideoPlayer } from './VideoPlayer'
import { usePreferenceValue } from 'hooks/usePreferenceValue'
import { getValue, setValue } from '@utils/preference'

const Player = () => {
  const [id, setId] = useState()
  const [showVideoPlayer, setShowVideoPlayer] = useState()
  const [inputText, setInputText] = useState()
  const [error, setError] = useState(false)
  const { preference: videosString, loading } = usePreferenceValue({
    key: 'videos',
  })

  const videos = JSON.parse(videosString) || {}
  if (loading) return

  // if there's a cached entry and not one already selected, use that
  if (Object.keys(videos).length > 0 && !showVideoPlayer && !id) {
    setId(Object.keys(videos)[0])
    setShowVideoPlayer(true)
  }

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

  const handleSubmit = () => {
    const id = getId(inputText)
    if (!id) return
    if (!videos[id]) videos[id] = {}
    setValue('videos', videos).then(() => {
      setId(id)
      // setShowVideoPlayer(true)
    })
  }

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
      {!showVideoPlayer && videos && videos.length > 0 && (
        <div className='vertical-container' style={{ alignSelf: 'center' }}>
          <List>
            {Object.keys(videos).map(e => (
              <ListItemButton
                key={e}
                onClick={() => {
                  setId(e)
                  setShowVideoPlayer(true)
                }}
              >
                {e}
              </ListItemButton>
            ))}
          </List>
        </div>
      )}
      {showVideoPlayer && (
        <VideoPlayer id={id} setShowVideoPlayer={setShowVideoPlayer} />
      )}
    </Card>
  )
}

export default Player
