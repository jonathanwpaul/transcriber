import { Card, TextField, Snackbar, SnackbarContent } from '@mui/material'
import { Controls, MusicRender } from './'
import { useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

const SCALE = 1

export const Editor = () => {
  const [selectedAbcElem, setSelectedAbcElem] = useState()
  const [duration, setDuration] = useState(1 / 4)
  const [inputMode, setInputMode] = useState('note')
  const [abcString, setAbcString] = useState('x')
  const [saves, setSaves] = useState([])
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const handleStringChange = e => {
    setAbcString(e.target.value)
  }

  //TODO: specify key to save
  const handleSave = async filename => {
    console.log(abcString)
    const resp = await Filesystem.writeFile({
      path: filename + '.abc',
      data: abcString,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    })
    console.log(resp)
    setToastMessage(`file saved to ${resp.uri}!`)
    setToastOpen(true)
  }

  const getSaves = async () => {
    const resp = await Filesystem.readdir({
      path: '',
      directory: Directory.Data,
    })
    setSaves(resp.files)
  }

  const loadSave = async selectedFile => {
    console.log('loading save: ', selectedFile)
    const { data } = await Filesystem.readFile({
      path: selectedFile.uri,
      encoding: Encoding.UTF8,
    })
    console.log(data)
    setAbcString(data)
    setToastMessage(`file loaded from ${selectedFile.uri}!`)
    setToastOpen(true)
  }

  const renderProps = {
    selectedAbcElem,
    setSelectedAbcElem,
    duration,
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
    duration,
    setDuration,
    handleSave,
    loadSave,
    getSaves,
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
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        color='primary'
        open={toastOpen}
        // autoHideDuration={2000}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
      />
    </div>
  )
}
