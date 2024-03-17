import { Card, TextField } from '@mui/material'

const TextFieldEditor = ({ onChange, value, ...otherProps }) => {
  return (
    <TextField
      fullWidth
      multiline
      onChange={onChange}
      value={value}
      InputProps={{ style: { height: '100%' } }}
      maxRows={5}
      {...otherProps}
    />
  )
}

export default TextFieldEditor
