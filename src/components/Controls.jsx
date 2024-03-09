import { useState } from 'react'
import { FolderOpen, Save } from '@mui/icons-material'
import { IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { FileDialog } from './FileDialog'
import {
  allPitches,
  updateAbcString,
  tokenize,
  getDurationText,
  durationMapping,
} from '../utils'
import { SaveAsDialog } from './SaveAsDialog'

export const Controls = ({
  selectedAbcElem,
  setSelectedAbcElem,
  abcString,
  setAbcString,
  duration,
  setDuration,
  inputMode,
  setInputMode,
  handleSave,
  loadSave,
  getSaves,
  saves,
}) => {
  const [fileDialogOpen, setFileDialogOpen] = useState()
  const [saveDialogOpen, setSaveDialogOpen] = useState()

  const barOptions = ['[|', '|', '|]', ':|', '|:']

  const handleDurationChange = (_, newValue) => {
    if (newValue === null) return

    setDuration(newValue)

    if (selectedAbcElem) {
      const originalText = abcString.substring(
        selectedAbcElem.startChar,
        selectedAbcElem.endChar
      )

      const tokenized = tokenize(originalText)
      tokenized.pop() // remove the last element, which should be the duration of the note

      const textDuration = getDurationText(newValue)

      console.log(textDuration)
      setAbcString(
        updateAbcString(
          abcString,
          selectedAbcElem,
          tokenized.join('') + textDuration
        )
      )
      setSelectedAbcElem(undefined)
    }
  }

  const handleNoteRestChange = (_, newValue) => {
    if (newValue === null) return

    setInputMode(newValue)

    if (selectedAbcElem) {
      const originalText = abcString.substring(
        selectedAbcElem.startChar,
        selectedAbcElem.endChar
      )

      const tokenized = tokenize(originalText)
      console.log(tokenized)
      let indexToSubstitute
      for (let i = tokenized.length; i--; i > 0) {
        //if the element is a note or rest
        if (
          allPitches.indexOf(tokenized[i]) >= 0 ||
          tokenized[i]?.toLowerCase() === 'z'
        ) {
          indexToSubstitute = i
          tokenized[i] = undefined
          break
        }
      }

      tokenized[indexToSubstitute] = newValue === 'note' ? 'c' : 'z'
      console.log(tokenized)
      setAbcString(
        updateAbcString(abcString, selectedAbcElem, tokenized.join(''))
      )
      setSelectedAbcElem(undefined)
    }
  }

  const handleInsertBarline = (_, newValue) => {
    console.log(selectedAbcElem)
    console.log(newValue)
    setAbcString(
      selectedAbcElem
        ? updateAbcString(abcString, selectedAbcElem, newValue, 'after')
        : abcString + newValue
    )
  }

  const handleAccidental = (_, newValue) => {
    if (!selectedAbcElem) return
    console.log(selectedAbcElem)
    console.log(
      tokenize(
        abcString.slice(selectedAbcElem.startChar, selectedAbcElem.endChar)
      )
    )
    setAbcString(
      updateAbcString(abcString, selectedAbcElem, newValue, 'before')
    )
  }

  return (
    <div className='horizontal-container' style={{ alignItems: 'center' }}>
      {/* duration button group (length of note or rest) */}
      <ToggleButtonGroup
        exclusive
        color='primary'
        onChange={handleDurationChange}
        value={duration}
      >
        {durationMapping.map(e => (
          <ToggleButton key={`${e.duration}`} value={e.duration}>
            {e.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <ToggleButtonGroup
        exclusive
        color='primary'
        onChange={handleNoteRestChange}
        value={inputMode}
      >
        {['note', 'rest'].map(e => (
          <ToggleButton key={`${e}`} value={e}>
            {e}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <ToggleButtonGroup exclusive color='primary' onChange={handleAccidental}>
        {[
          { label: '#', value: '^' },
          { label: 'b', value: '_' },
        ].map(e => (
          <ToggleButton key={e.label} value={e.value}>
            {e.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <ToggleButtonGroup
        exclusive
        color='primary'
        onChange={handleInsertBarline}
      >
        {barOptions.map(e => (
          <ToggleButton key={e} value={e}>
            {e}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {/* input mode button group (note or rest) */}

      <IconButton onClick={() => setSaveDialogOpen(true)}>
        <Save />
      </IconButton>
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
