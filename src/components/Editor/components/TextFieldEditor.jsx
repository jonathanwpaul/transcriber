import { TextField } from '@mui/material'

const TextFieldEditor = ({
  onChange,
  selectedAbcElem,
  value,
  ...otherProps
}) => {
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
