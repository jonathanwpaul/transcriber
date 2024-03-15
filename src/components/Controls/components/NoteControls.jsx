import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { allPitches, getDurationText } from '../../../utils'

const NoteControls = ({ onChange, duration }) => {
  const notes = allPitches.slice(
    allPitches.indexOf('B'),
    allPitches.indexOf("b'")
  )

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
