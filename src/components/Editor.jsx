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
      <Card
        elevation={5}
        className='music-render'
        style={{ overflow: 'auto', flex: 1 }}
      >
        <MusicRender id='music-render' />
      </Card>
      <TextField
        fullWidth
        multiline
        onChange={handleChange}
      />
    </div>
  )
}
