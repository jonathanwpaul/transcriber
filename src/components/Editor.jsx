import { Card, TextField } from '@mui/material'
import { Controls, MusicRender } from './'
import abcjs from 'abcjs'
// import allNotes from 'abcjs/src/parse/all-notes.js' //invasively importing non-indexed module export
import { useEffect, useState, useRef } from 'react'
import { allPitches, moveNote, tokenize } from '../utils'
import { Preferences } from '@capacitor/preferences'

const SCALE = 1

export const Editor = () => {
  const [selectedAbcElem, setSelectedAbcElem] = useState()
  const [durationValue, setDuration] = useState('1')
  const [inputMode, setInputMode] = useState('note')
  const [abcString, setAbcString] = useState('')
  const [saves, setSaves] = useState([])

  const handleStringChange = e => {
    setAbcString(e.target.value)
  }

  //TODO: specify key to save
  const handleSave = async () => {
    console.log(abcString)
    await Preferences.set({ key: 3, value: abcString })
    const { keys } = await Preferences.keys()
    console.log(keys)
    setSaves(keys)
  }

  const loadSave = async selectedValue => {
    console.log('loading save: ', selectedValue)
    const { value } = await Preferences.get({ key: selectedValue })
    console.log(value)
    setAbcString(value)
  }

  const renderProps = {
    selectedAbcElem,
    setSelectedAbcElem,
    durationValue,
    setDuration,
    inputMode,
    setInputMode,
    abcString,
    setAbcString,
  }

  const controlsProps = {
    selectedAbcElem,
    setSelectedAbcElem,
    abcString,
    setAbcString,
    inputMode,
    setInputMode,
    durationValue,
    setDuration,
    handleSave,
    loadSave,
    saves,
  }

  return (
    <div className='editor vertical-container' id='editor'>
      <MusicRender {...renderProps} />
      <Card elevation={5} className='editor-inputs'>
        <TextField
          fullWidth
          multiline
          onChange={handleStringChange}
          value={abcString}
          maxRows={1.5}
        />
        <Controls {...controlsProps} />
      </Card>
    </div>
  )
}
