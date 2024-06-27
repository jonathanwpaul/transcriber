import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useEffect, useState } from 'react'
import { Preferences } from '@capacitor/preferences'

const UndoRedoControls = ({ undoStack, setAbcString }) => {
  const [index, setIndex] = useState(-1)

  const handler = change => {
    setIndex(index => index + change)
    setAbcString(undoStack[index])
  }

  return (
    <ToggleButtonGroup onChange={(_, v) => handler(v)}>
      <ToggleButton value={-1}>Undo</ToggleButton>
      <ToggleButton value={1}>Redo</ToggleButton>
    </ToggleButtonGroup>
  )
}

export default UndoRedoControls
