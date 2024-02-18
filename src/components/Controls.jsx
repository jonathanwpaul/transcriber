import {
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'

export const Controls = ({ durationValue, setDuration }) => {
  const handleDurationChange = (_, newValue) => {
    setDuration(newValue)
  }
  return (
    <div className='horizontal-container'>
      <FormControlLabel control={<Switch name='gilad' />} label='input mode' />
      <ToggleButtonGroup
        exclusive
        color='primary'
        onChange={handleDurationChange}
        value={durationValue}
      >
        {['8', '4', '2', '1', '/', '//', '///'].map(e => (
          <ToggleButton key={`${e}`} value={e}>
            {e}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  )
}
