import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { getDurationText } from '../../../utils'

const NoteControls = ({ onChange, duration }) => {
  const notes = "b,, c, d, e, f, g, a, b, c d e f g a b c' d' e' f'".split(' ')

  return (
    <ToggleButtonGroup exclusive color='primary' onChange={onChange}>
      {notes.map(e => (
        <ToggleButton key={e} value={e + getDurationText(duration)}>
          {e}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export default NoteControls
