import { useState } from 'react'
import { FolderOpen, Save } from '@mui/icons-material'
import { IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { FileDialog } from '../FileDialog'
import { ScaleFactorAdjust } from './components'
import {
  allPitches,
  updateAbcString,
  tokenize,
  getDurationText,
  durationMapping,
  noteRegEx,
  moveNote,
} from '../../utils'
import { SaveAsDialog } from '../SaveAsDialog'

export const Controls = ({
  selectedAbcElem,
  setSelectedAbcElem,
  setSCALE,
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
  console.log('***controls render')

  const [fileDialogOpen, setFileDialogOpen] = useState()
  const [saveDialogOpen, setSaveDialogOpen] = useState()

  const barOptions = ['[|', '|', '|]', ':|', '|:']

  const handleDurationChange = (_, newValue) => {
    if (newValue === null) return

    if (selectedAbcElem) {
      const originalText = abcString.substring(
        selectedAbcElem.startChar,
        selectedAbcElem.endChar
      )

      const tokenized = tokenize(originalText)
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
    } else {
      setDuration(newValue)
    }
  }

  const handleNoteRestChange = (_, newValue) => {
    if (newValue === null) return
    console.log('newValue ', newValue)

    console.log('selectedAbcElem', selectedAbcElem)
    if (selectedAbcElem) {
      const originalText = abcString.substring(
        selectedAbcElem.startChar,
        selectedAbcElem.endChar
      )

      const tokenized = tokenize(originalText)
      console.log('tknzed ', tokenized)
      const indexToSubstitute = tokenized.findIndex(val => noteRegEx.test(val))
      // for (let i = tokenized.length; i--; i > 0) {
      //   //if the element is a note or rest
      //   if (
      //     allPitches.indexOf(tokenized[i]) >= 0 ||
      //     tokenized[i]?.toLowerCase() === 'z'
      //   ) {
      //     indexToSubstitute = i
      //     break
      //   }
      // }

      tokenized[indexToSubstitute] = newValue === 'note' ? 'c' : 'z'

      console.log('tknzed post sub ', tokenized)
      setAbcString(
        updateAbcString(
          abcString,
          selectedAbcElem.startChar,
          selectedAbcElem.endChar,
          tokenized.join('')
        )
      )
    } else {
      setInputMode(newValue)
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

    if (newIndex >= accidentalPossibilities.length || newIndex < 0) {
      tokenized = [moveNote(tokenized[1], -1 * enteredValue)] //multiply by -1 because the array is in opposite order
    } else {
      tokenized[0] = accidentalPossibilities[newIndex]
    }
    setAbcString(
      updateAbcString(
        abcString,
        selectedAbcElem.startChar,
        selectedAbcElem.endChar,
        tokenized.join('')
      )
    )
  }

  const handleInsert = (_, value) => {
    setAbcString(abcString => abcString + value)
  }
  return (
    <div
      className='horizontal-container'
      style={{ alignItems: 'center', flexWrap: 'wrap' }}
    >
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

      {/* Accidentals */}
      <ToggleButtonGroup exclusive color='primary' onChange={handleInsert}>
        {[
          { label: '#', value: '^' },
          { label: 'n', value: '=' },
          { label: 'b', value: '_' },
        ].map(e => (
          <ToggleButton key={e.label} value={e.value}>
            {e.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Barlines */}
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
      <ScaleAdjust />
    </div>
  )
}
