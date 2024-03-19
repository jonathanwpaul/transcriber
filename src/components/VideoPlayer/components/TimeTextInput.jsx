import { Add, Remove } from '@mui/icons-material'
import { IconButton, TextField } from '@mui/material'

const TimeTextInput = ({ onChange, value, changeAmount }) => {
  const handleChange = amt => {
    onChange(value + amt)
  }
  return (
    <div className='horizontal-container' style={{ alignItems: 'center' }}>
      <TextField value={value} onChange={e => onChange(e.target.value)} />
      <div className='vertical-container'>
        <IconButton onClick={() => handleChange(changeAmount)}>
          <Add />
        </IconButton>
        <IconButton onClick={() => handleChange(-1 * changeAmount)}>
          <Remove />
        </IconButton>
      </div>
    </div>
  )
}
export default TimeTextInput
