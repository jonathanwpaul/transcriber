import MusicRender from './MusicRender/MusicRender'
import Controls from '../Controls/Controls'
import { TextFieldEditor } from './components'
import { Card, Snackbar, SnackbarContent } from '@mui/material'
import { Profiler, useCallback, useEffect, useRef, useState } from 'react'
import { Preferences } from '@capacitor/preferences'
import { abcStringToArr } from '../../utils'

const Editor = () => {
  const [abcString, setAbcString] = useState('a,1b,1c1d1e1f1g1')
  const [duration, setDuration] = useState(1 / 4)
  const [selectedIndex, setSelectedIndex] = useState()
  const [scaleFactor, setScaleFactor] = useState(1)
  const [textEditor, setTextEditor] = useState(false)

  const arr = abcStringToArr(abcString)
  console.log({ arr })

  const textFieldRef = useRef()
  const visualObjRef = useRef()

  const voiceArr =
    visualObjRef.current && visualObjRef.current[0].lines[0].staff[0].voices[0]

  const selectedAbcElem = voiceArr && voiceArr[selectedIndex]
  console.log('editor selectedelem:', selectedAbcElem)
  /**
   * selects the currently selected note in the text input
   * TODO: this executes before selected Abc elem is updated
   */
  useEffect(() => {
    const input = textFieldRef.current
    if (input && selectedAbcElem) {
      input.setSelectionRange(
        selectedAbcElem.startChar,
        selectedAbcElem.endChar
      )
      input.focus()
    }
  })

  const handleStringChange = e => {
    setAbcString(e.target.value)
  }

  const renderProps = {
    abcString,
    duration,
    scaleFactor,
    selectedAbcElem,
    setAbcString,
    setDuration,
    setScaleFactor,
    setSelectedIndex,
    visualObjRef,
  }

  const controlsProps = {
    abcString,
    duration,
    selectedAbcElem,
    setAbcString,
    setDuration,
    setScaleFactor,
    setSelectedIndex,
    setTextEditor,
    textEditor,
    textFieldRef,
    voiceArr,
  }

  // useEffect(() => {
  //   const pushStack = async () => {
  //     const limit = 50 // set the limit of how many entries are stored on the stack
  //     const { value } = await Preferences.get({ key: 'undoHistory' })
  //     const stack = (JSON.parse(value) || []).slice(-1 * limit)
  //     console.log(stack)
  //     stack.push(abcString)
  //     await Preferences.set({
  //       key: 'undoHistory',
  //       value: JSON.stringify(stack),
  //     })
  //   }

  //   pushStack()
  // }, [abcString])

  return (
    <div className='editor vertical-container' id='editor'>
      <MusicRender {...renderProps} />
      <Card className='editor-inputs'>
        <Controls {...controlsProps} />

        <TextFieldEditor
          onChange={handleStringChange}
          // disabled={!textEditor}
          selectedAbcElem={selectedAbcElem}
          value={abcString}
          inputRef={textFieldRef}
        />
      </Card>
    </div>
  )
}

export default Editor
