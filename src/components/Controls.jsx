import { useState } from 'react'
import { FolderOpen, Save } from '@mui/icons-material'
import { IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Dialog } from './Dialog'

export const Controls = ({
  selectedAbcElem,
  abcString,
  setAbcString,
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
      {/* duration button group (length of note or rest) */}
      <ToggleButtonGroup
        exclusive
        color='primary'
        onChange={(_, newValue) => {
          setDuration(newValue)
          console.log(abcString)
          const { startChar, endChar } = selectedAbcElem
          const newString =
            abcString.slice(0, startChar) +
            abcString.slice(startChar, endChar)[0] +
            newValue +
            abcString.slice(endChar)
          setAbcString(newString)
        }}
        value={durationValue}
      >
        {['8', '4', '2', '1', '/', '//', '///'].map(e => (
          <ToggleButton key={`${e}`} value={e}>
            {e}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* input mode button group (note or rest) */}
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
