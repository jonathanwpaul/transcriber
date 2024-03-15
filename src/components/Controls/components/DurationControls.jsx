import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { durationMapping } from '../../../utils'

export const DurationControls = ({ onChange, duration }) => {
  return (
    <ToggleButtonGroup
      exclusive
      color='primary'
      onChange={onChange}
      value={duration}
    >
      {durationMapping.map(e => (
        <ToggleButton key={`${e.duration}`} value={e.duration}>
          {e.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export default DurationControls
