import { Card, TextField } from '@mui/material'

const TextFieldEditor = ({ onChange, value, ...otherProps }) => {
  return (
    <Card elevation={5} className='editor-inputs'>
      <TextField
        fullWidth
        multiline
        onChange={onChange}
        value={value}
        InputProps={{ style: { height: '100%' } }}
        maxRows={5}
        {...otherProps}
      />
    </Card>
  )
}

export default TextFieldEditor
