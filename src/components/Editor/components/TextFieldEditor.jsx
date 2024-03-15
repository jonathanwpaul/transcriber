import { Card, TextField } from '@mui/material'

const TextFieldEditor = ({ onChange, value }) => {
  return (
    <Card elevation={5} className='editor-inputs'>
      <TextField
        fullWidth
        multiline
        onChange={onChange}
        value={value}
        InputProps={{ style: { height: '100%' } }}
        maxRows={5}
      />
    </Card>
  )
}

export default TextFieldEditor
