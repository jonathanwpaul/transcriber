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
import SpecialCharacterControls from './components/SpecialCharacterControls'

const Controls = ({
  abcString,
  duration,
  selectedAbcElem,
  setAbcString,
  setDuration,
  setSelectedIndex,
  setTextEditor,
  textEditor,
  textFieldRef,
  voiceArr,
}) => {
  // const [undoStack, setUndoStack] = useState()

  const handleDurationChange = (_, newValue) => {
    if (newValue === null) return
    setDuration(newValue)
  }

  const handleInsert = (_, value) => {
    setAbcString(
      selectedAbcElem
        ? abcString.slice(0, selectedAbcElem.endChar) +
            value +
            abcString.slice(selectedAbcElem.endChar)
        : abcString + value
    )

    setSelectedIndex(
      selectedAbcElem
        ? selectedAbcElem.abselem.counters.note + 1
        : voiceArr.length
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
        {/* <InputControls onChange={handleInputChange} textEditor={textEditor} /> */}
        {/* TODO: the octaves don't work when a duration is applied (which is pretty much always) since it inserts after the number */}
        {/* <OctaveControls onChange={handleInsert} /> */}
        <DurationControls onChange={handleDurationChange} duration={duration} />
        <SpecialCharacterControls onChange={handleInsert} />
        {/* <AccidentalControls onChange={handleInsert} /> */}
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
      </div>
      {!textEditor && (
        <NoteControls onChange={handleInsert} duration={duration} />
      )}
    </>
  )
}

export default Controls
