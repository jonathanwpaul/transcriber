import { Card, TextField } from '@mui/material'
import { MusicRender } from './MusicRender'
import abcjs from 'abcjs'

export const Editor = () => {
  const handleChange = e => {
    abcjs.renderAbc('music-render', e.target.value)
  }
  return (
    <div
      className='editor vertical-container'
      id='editor'
    >
      <TextField
        fullWidth
        multiline
        onChange={handleChange}
      />
      <Card className='music-render'>
        <MusicRender id='music-render' />
      </Card>
    </div>
  )
}
