import { useEffect, useState } from 'react'
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
  UndoRedoControls,
} from './components'
import { updateAbcString, tokenize, noteRegEx, moveNote } from '../../utils'
import { Preferences } from '@capacitor/preferences'

const Controls = ({
  abcString,
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
  // const [undoStack, setUndoStack] = useState()

  const handleDurationChange = (_, newValue) => {
    if (newValue === null) return
    setDuration(newValue)
  }

  const handleInsert = (_, value) => {
    setAbcString(
      abcString.slice(0, selectedAbcElem.endChar) +
        value +
        abcString.slice(selectedAbcElem.endChar)
    )
  }

  const handleInputChange = (_, value) => {
    setTextEditor(value === 'text')
  }

  // const getUndoStack = async () => {
  //   const { value } = await Preferences.get({ key: 'undoHistory' })
  //   const stack = JSON.parse(value) || []
  //   setUndoStack(stack)
  // }

  // useEffect(() => {
  //   getUndoStack()
  // }, [abcString])

  return (
    <>
      <div
        className='horizontal-container'
        style={{ alignItems: 'center', flexWrap: 'wrap' }}
      >
        <InputControls onChange={handleInputChange} textEditor={textEditor} />
        {/* TODO: the octaves don't work when a duration is applied (which is pretty much always) since it inserts after the number */}
        {/* <OctaveControls onChange={handleInsert} /> */}
        <DurationControls onChange={handleDurationChange} duration={duration} />
        <AccidentalControls onChange={handleInsert} />
        <BarlineControls onChange={handleInsert} />
        {/* <CursorControls
          abcString={abcString}
          cursorPosition={cursorPosition}
          handleSpaceInput={handleInsert}
          setCursorPosition={setCursorPosition}
          textFieldRef={textFieldRef}
        /> */}
        {/* {undoStack && undoStack.length > 0 && (
          <UndoRedoControls undoStack={undoStack} setAbcString={setAbcString} />
        )} */}
        <SaveLoadControls setAbcString={setAbcString} abcString={abcString} />
      </div>
      {!textEditor && (
        <NoteControls onChange={handleInsert} duration={duration} />
      )}
    </>
  )
}

export default Controls
