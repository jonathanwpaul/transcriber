import { useState } from 'react'
import { FolderOpen, Save } from '@mui/icons-material'
import {
  Card,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import {
  AccidentalControls,
  BarlineControls,
  CursorControls,
  DurationControls,
  InputControls,
  NoteControls,
  OctaveControls,
  SaveLoadControls,
} from './components'
import { updateAbcString, tokenize, noteRegEx, moveNote } from '../../utils'

const Controls = ({
  abcString,
  cursorPosition,
  duration,
  selectedAbcElem,
  setAbcString,
  setCursorPosition,
  setDuration,
  setScaleFactor,
  setSelectedAbcElem,
  setTextEditor,
  textEditor,
  textFieldRef,
}) => {
  const handleDurationChange = (_, newValue) => {
    if (newValue === null) return
    setDuration(newValue)
  }

  const handleInsert = (_, value) => {
    setAbcString(
      abcString.slice(0, cursorPosition) +
        value +
        abcString.slice(cursorPosition)
    )
    setCursorPosition(cursorPosition + value.length)
  }

  const handleInputChange = (_, value) => {
    setTextEditor(value === 'text')
  }

  return (
    <>
      <div
        className='horizontal-container'
        style={{ alignItems: 'center', flexWrap: 'wrap' }}
      >
        {/* TODO: the octaves don't work when a duration is applied (which is pretty much always) since it inserts after the number */}
        {/* <OctaveControls onChange={handleInsert} /> */}
        <InputControls onChange={handleInputChange} textEditor={textEditor} />
        <AccidentalControls onChange={handleInsert} />
        <DurationControls onChange={handleDurationChange} duration={duration} />
        <BarlineControls onChange={handleInsert} />
        <CursorControls
          abcString={abcString}
          cursorPosition={cursorPosition}
          setCursorPosition={setCursorPosition}
          textFieldRef={textFieldRef}
        />
        <SaveLoadControls setAbcString={setAbcString} abcString={abcString} />
      </div>
      {!textEditor && (
        <NoteControls onChange={handleInsert} duration={duration} />
      )}
    </>
  )
}

export default Controls
