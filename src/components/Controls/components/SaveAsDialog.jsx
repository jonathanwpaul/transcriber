import {
  Button,
  DialogTitle,
  Dialog as MuiDialog,
  TextField,
} from '@mui/material'
import { useState } from 'react'

export const SaveAsDialog = ({
  open,
  onClose,
  selectedValue,
  items,
  ...otherProps
}) => {
  const [fileName, setFileName] = useState(new Date().toISOString())
  const handleClose = () => {
    onClose(selectedValue)
  }

  const handleSubmitClick = () => {
    onClose(fileName)
  }

  return (
    <MuiDialog onClose={handleClose} open={open} {...otherProps}>
      <DialogTitle>Provide a name:</DialogTitle>
      <div className='horizontal-container' style={{ flex: 1, padding: 20 }}>
        <TextField
          style={{ flex: 1 }}
          value={fileName}
          onChange={e => setFileName(e.target.value)}
          //TODO: make this follow same validation as button submit
          // onKeyDown={e => e.key === 'Enter' && handleSubmitClick()}
        />
        <Button
          disabled={!(fileName || fileName.length > 0)}
          onClick={handleSubmitClick}
          variant='contained'
        >
          Save
        </Button>
      </div>
    </MuiDialog>
  )
}
