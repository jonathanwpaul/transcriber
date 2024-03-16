import { ToggleButton, ToggleButtonGroup } from '@mui/material'

const OctaveControls = ({ onChange }) => {
  const octaveMarks = [',', "'"]
  return (
    <ToggleButtonGroup exclusive color='primary' onChange={onChange}>
      {octaveMarks.map(e => (
        <ToggleButton key={e} value={e}>
          {e}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
export default OctaveControls
