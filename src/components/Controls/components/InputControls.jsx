import { ToggleButton, ToggleButtonGroup } from '@mui/material'

const ToggleInputControls = ({ onChange, textEditor }) => {
  return (
    <ToggleButtonGroup
      exclusive
      color='primary'
      onChange={onChange}
      value={textEditor ? 'text' : 'keys'}
    >
      <ToggleButton value='text'>{'</>'}</ToggleButton>
      <ToggleButton value='keys'>{'k'}</ToggleButton>
    </ToggleButtonGroup>
  )
}

export default ToggleInputControls
