import { useState, useRef, useCallback } from 'react'
import {
  IconButton,
  Card,
  Slider,
  TextField,
  Button,
  Typography,
} from '@mui/material'
import { SkipPrevious, PlayArrow, PauseCircle } from '@mui/icons-material'
import YouTube from 'react-youtube'
import { VideoPlayer } from './VideoPlayer'

const Player = () => {
  const [id, setId] = useState()
  const [inputText, setInputText] = useState()
  const [error, setError] = useState(false)

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
    setId(getId(inputText))
  }

  return (
    <Card elevation={5} className='player'>
      {!id && (
        <div className='horizontal-container' style={{ alignSelf: 'center' }}>
          <TextField
            error={error}
            fullWidth
            helperText={error}
            onChange={handleChange}
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
      {id && <VideoPlayer id={id} setId={setId} />}
    </Card>
  )
}

export default Player
