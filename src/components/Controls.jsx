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
      console.log(tokenized)
      tokenized.pop() // remove the last element, which should be the duration of the note

      const textDuration = getDurationText(newValue)

      setAbcString(
        updateAbcString(
          abcString,
          selectedAbcElem.startChar,
          selectedAbcElem.endChar,
          tokenized.join('') + textDuration
        )
      )
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
          break
        }
      }

      tokenized[indexToSubstitute] = newValue === 'note' ? 'c' : 'z'
      const insertString = updateAbcString(
        abcString,
        selectedAbcElem.startChar,
        selectedAbcElem.endChar,
        tokenized.join('')
      )
      console.log(insertString)
      setAbcString(insertString)
    }
  }

  const handleInsertBarline = (_, newValue) => {
    setAbcString(
      selectedAbcElem
        ? updateAbcString(
            abcString,
            selectedAbcElem.startChar,
            selectedAbcElem.endChar,
            abcString.slice(
              selectedAbcElem.startChar,
              selectedAbcElem.endChar
            ) + newValue
          )
        : abcString + newValue
    )
  }

  const handleAccidental = (_, enteredValue) => {
    if (!selectedAbcElem) return
    let tokenized = tokenize(
      abcString.slice(selectedAbcElem.startChar, selectedAbcElem.endChar)
    )

    console.log(tokenized)
    const accidentalPossibilities = ['__', '_', '', '^', '^^']
    const currentAccidental = tokenized[0]
    let index = accidentalPossibilities.indexOf(currentAccidental)

    const newIndex = index + enteredValue

    tokenized[0] = accidentalPossibilities[newIndex]

    setAbcString(
      updateAbcString(
        abcString,
        selectedAbcElem.startChar,
        selectedAbcElem.endChar,
        tokenized.join('')
      )
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
          { label: '#', value: 1 },
          { label: 'b', value: -1 },
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
