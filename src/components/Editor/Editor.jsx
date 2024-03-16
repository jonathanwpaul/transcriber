import MusicRender from '../MusicRender'
import Controls from '../Controls/Controls'
import { TextFieldEditor } from './components'
import { Card, Snackbar, SnackbarContent } from '@mui/material'
import { Profiler, useCallback, useEffect, useRef, useState } from 'react'

const Editor = () => {
  const [abcString, setAbcString] = useState('ddddddd')
  const [cursorPosition, setCursorPosition] = useState()
  const [duration, setDuration] = useState(1 / 4)

  const [scaleFactor, setScaleFactor] = useState(1)

  const textFieldRef = useRef()

  console.log(textFieldRef)

  const handleStringChange = e => {
    setAbcString(e.target.value)
  }

  const renderProps = {
    scaleFactor,
    duration,
    setDuration,
    abcString,
    setAbcString,
  }

  const controlsProps = {
    abcString,
    duration,
    setAbcString,
    setDuration,
    setScaleFactor,
    textFieldRef,
  }

  return (
    <div className='editor vertical-container' id='editor'>
      <MusicRender {...renderProps} />
      <TextFieldEditor
        onChange={handleStringChange}
        value={abcString}
        inputRef={textFieldRef}
      />
      <Controls {...controlsProps} />
    </div>
  )
}

export default Editor
