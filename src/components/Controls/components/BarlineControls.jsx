import { ToggleButton, ToggleButtonGroup } from '@mui/material'

export const BarlineControls = ({ onChange }) => {
  const barOptions = ['[|', '|:', '|', ':|', '|]']

  return (
    <ToggleButtonGroup exclusive color='primary' onChange={onChange}>
      {barOptions.map(e => (
        <ToggleButton key={e} value={e}>
          {e}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export default BarlineControls
