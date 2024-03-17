import MusicRender from './MusicRender/MusicRender'
import Controls from '../Controls/Controls'
import { TextFieldEditor } from './components'
import { Card, Snackbar, SnackbarContent } from '@mui/material'
import { Profiler, useCallback, useEffect, useRef, useState } from 'react'

const Editor = () => {
  const [abcString, setAbcString] = useState('a,1b,1c1d1e1f1g1')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [duration, setDuration] = useState(1 / 4)
  const [scaleFactor, setScaleFactor] = useState(1)
  const [textEditor, setTextEditor] = useState(false)

  const textFieldRef = useRef()

  // useEffect(() => {
  //   const input = textFieldRef.current
  //   if (input) input.setSelectionRange(cursorPosition, cursorPosition)
  // }, [textFieldRef, cursorPosition, abcString])

  console.log('Editor cursor position: ', cursorPosition)

  const handleStringChange = e => {
    // setCursorPosition(e.target.selectionStart)
    setAbcString(e.target.value)
  }

  const renderProps = {
    abcString,
    duration,
    scaleFactor,
    setAbcString,
    setCursorPosition,
    setDuration,
    setScaleFactor,
  }

  const controlsProps = {
    abcString,
    cursorPosition,
    duration,
    setAbcString,
    setDuration,
    setScaleFactor,
    setCursorPosition,
    setTextEditor,
    textEditor,
    textFieldRef,
  }

  return (
    <div className='editor vertical-container' id='editor'>
      <MusicRender {...renderProps} />
      <Card className='editor-inputs'>
        <Controls {...controlsProps} />

        <TextFieldEditor
          onChange={handleStringChange}
          disabled={!textEditor}
          value={abcString}
          inputRef={textFieldRef}
        />
      </Card>
    </div>
  )
}

export default Editor
