import { Add, Remove } from '@mui/icons-material'
import { IconButton, TextField } from '@mui/material'

const TimeTextInput = ({ onChange, value, changeAmount, min = 0, max }) => {
  const handleChange = amt => {
    const newValue = value + amt
    if ((amt < 0 && newValue >= min) || (amt > 0 && newValue <= max))
      onChange(newValue)
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
