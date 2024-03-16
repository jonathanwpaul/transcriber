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
  NoteControls,
  OctaveControls,
  SaveLoadControls,
  ScaleFactorControls,
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
  textFieldRef,
}) => {
  const handleDurationChange = (_, newValue) => {
    if (newValue === null) return
    setDuration(newValue)
  }

  const handleInsert = (_, value) => {
    setAbcString(abcString => abcString + value)
  }

  return (
    <>
      <Card elevation={5} className='keyboard'>
        <NoteControls onChange={handleInsert} duration={duration} />
      </Card>
      <Card elevation={5} className='editor-inputs'>
        <div
          className='horizontal-container'
          style={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          {/* TODO: the octaves don't work when a duration is applied (which is pretty much always) since it inserts after the number */}
          {/* <OctaveControls onChange={handleInsert} /> */}
          <AccidentalControls onChange={handleInsert} />
          <DurationControls
            onChange={handleDurationChange}
            duration={duration}
          />
          <BarlineControls onChange={handleInsert} />
          {/* <CursorControls textFieldRef={textFieldRef} /> */}
          <ScaleFactorControls setScaleFactor={setScaleFactor} />
          <SaveLoadControls setAbcString={setAbcString} abcString={abcString} />
        </div>
      </Card>
    </>
  )
}

export default Controls
