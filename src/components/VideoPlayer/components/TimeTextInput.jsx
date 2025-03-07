import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
const TimeTextInput = props => {
  const { onChange, value, changeAmount, min = 0, max, ...otherProps } = props

  const handleChange = amt => {
    const newValue = value + amt
    if ((amt < 0 && newValue >= min) || (amt > 0 && newValue <= max))
      onChange(newValue)
  }

  return (
    <div
      className='horizontal-container'
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 150,
        width: 200,
      }}
    >
      <TextField
        value={value}
        onChange={e => onChange(e.target.value)}
        {...otherProps}
        InputProps={{
          endAdornment: (
            <>
              <InputAdornment position='end'>
                <IconButton
                  onClick={() => handleChange(-1 * changeAmount)}
                  edge='end'
                >
                  <KeyboardArrowDown />
                </IconButton>
              </InputAdornment>
              <InputAdornment position='end'>
                <IconButton
                  onClick={() => handleChange(changeAmount)}
                  edge='end'
                >
                  <KeyboardArrowUp />
                </IconButton>
              </InputAdornment>
            </>
          ),
          style: { minWidth: '80px' },
        }}
      />
    </div>
  )
}
export default TimeTextInput
