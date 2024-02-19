import { Save } from '@mui/icons-material'
import {
  IconButton,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'

export const Controls = ({
  durationValue,
  setDuration,
  inputMode,
  setInputMode,
  handleSave,
  loadSave,
  saves,
}) => {
  return (
    <div className='horizontal-container' style={{ alignContent: 'center' }}>
      <ToggleButtonGroup
        exclusive
        color='primary'
        onChange={(_, newValue) => setDuration(newValue)}
        value={durationValue}
      >
        {['8', '4', '2', '1', '/', '//', '///'].map(e => (
          <ToggleButton key={`${e}`} value={e}>
            {e}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <ToggleButtonGroup
        exclusive
        color='primary'
        onChange={(_, newValue) => setInputMode(newValue)}
        value={inputMode}
      >
        {['note', 'rest'].map(e => (
          <ToggleButton key={`${e}`} value={e}>
            {e}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <IconButton onClick={handleSave}>
        <Save></Save>
      </IconButton>
      <Select onChange={loadSave}>
        {saves && saves.map(save => <MenuItem value={save}>{save}</MenuItem>)}
      </Select>
    </div>
  )
}
