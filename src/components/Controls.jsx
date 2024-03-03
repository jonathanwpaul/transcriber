import { useState } from 'react'
import { FolderOpen, Save } from '@mui/icons-material'
import { IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Dialog } from './Dialog'
import { allPitches, updateAbcString, tokenize } from '../utils'

export const Controls = ({
  selectedAbcElem,
  setSelectedAbcElem,
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

  const handleDurationChange = (_, newValue) => {
    if (newValue === null) return

    setDuration(newValue)

    if (selectedAbcElem) {
      const originalText = abcString.substring(
        selectedAbcElem.startChar,
        selectedAbcElem.endChar
      )

      console.log(selectedAbcElem)
      const tokenized = tokenize(originalText)
      console.log(tokenized)

      tokenized.pop() // remove the last element, which should be the duration of the note
      console.log(tokenized)

      setAbcString(
        updateAbcString(
          abcString,
          selectedAbcElem,
          tokenized.join('') + newValue
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

  return (
    <div className='horizontal-container' style={{ alignItems: 'center' }}>
      {/* duration button group (length of note or rest) */}
      <ToggleButtonGroup
        exclusive
        color='primary'
        onChange={handleDurationChange}
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
        onChange={handleNoteRestChange}
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
