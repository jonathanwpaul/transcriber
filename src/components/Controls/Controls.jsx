import { useState } from 'react'
import { FolderOpen, Save } from '@mui/icons-material'
import { IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { FileDialog } from '../FileDialog'
import {
  AccidentalControls,
  BarlineControls,
  DurationControls,
  NoteControls,
  SaveLoadControls,
  ScaleFactorControls,
} from './components'
import { updateAbcString, tokenize, noteRegEx, moveNote } from '../../utils'
import { SaveAsDialog } from '../SaveAsDialog'

const Controls = ({
  selectedAbcElem,
  setSelectedAbcElem,
  setScaleFactor,
  abcString,
  setAbcString,
  duration,
  setDuration,
  handleSave,
  loadSave,
  getSaves,
  saves,
}) => {
  const [fileDialogOpen, setFileDialogOpen] = useState()
  const [saveDialogOpen, setSaveDialogOpen] = useState()

  const handleDurationChange = (_, newValue) => {
    if (newValue === null) return
    setDuration(newValue)
  }

  const handleInsert = (_, value) => {
    setAbcString(abcString => abcString + value)
  }

  return (
    <div
      className='horizontal-container'
      style={{ alignItems: 'center', flexWrap: 'wrap' }}
    >
      <NoteControls onChange={handleInsert} duration={duration} />
      <DurationControls onChange={handleDurationChange} duration={duration} />
      <AccidentalControls onChange={handleInsert} />
      <BarlineControls onChange={handleInsert} />
      <ScaleFactorControls setScaleFactor={setScaleFactor} />
      {/* save */}
      <IconButton onClick={() => setSaveDialogOpen(true)}>
        <Save />
      </IconButton>
      {/* load */}
      <IconButton
        onClick={() => {
          getSaves()
          setFileDialogOpen(true)
        }}
      >
        <FolderOpen />
      </IconButton>
      <FileDialog
        open={fileDialogOpen}
        onClose={file => {
          file && loadSave(file)
          setFileDialogOpen(false)
        }}
        items={saves}
        fullWidth
        maxWidth='md'
      />
      <SaveAsDialog
        open={saveDialogOpen}
        onClose={filename => {
          filename && handleSave(filename)
          setSaveDialogOpen(false)
        }}
        fullWidth
        maxWidth='md'
      />
    </div>
  )
}

export default Controls
