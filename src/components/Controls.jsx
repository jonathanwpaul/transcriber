import { useState } from 'react'
import { FolderOpen, Save } from '@mui/icons-material'
import { IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Dialog } from './Dialog'

export const Controls = ({
  durationValue,
  setDuration,
  inputMode,
  setInputMode,
  handleSave,
  loadSave,
  saves,
}) => {
  const [dialogOpen, setDialogOpen] = useState()
  return (
    <div className='horizontal-container' style={{ alignItems: 'center' }}>
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
        <Save />
      </IconButton>
      <IconButton onClick={() => setDialogOpen(true)}>
        <FolderOpen />
      </IconButton>
      <Dialog
        open={dialogOpen}
        onClose={value => {
          value && loadSave(value)
          setDialogOpen(false)
        }}
        items={saves}
        fullWidth
        maxWidth='md'
      />
    </div>
  )
}
