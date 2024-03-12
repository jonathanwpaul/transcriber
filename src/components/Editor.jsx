import { Card, TextField, Snackbar, SnackbarContent } from '@mui/material'
import { Controls, MusicRender } from './'
import { useEffect, useState } from 'react'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

const SCALE = 1

export const Editor = () => {
  const [selectedAbcElem, setSelectedAbcElem] = useState()
  const [duration, setDuration] = useState(1 / 4)
  const [inputMode, setInputMode] = useState('note')
  const [abcString, setAbcString] = useState('xddddddd')
  const [saves, setSaves] = useState([])
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  console.log('selectedAbcElem: ', selectedAbcElem)
  useEffect(() => {
    const dataIndex =
      selectedAbcElem?.abselem.elemset[0].getAttribute('data-index')
    const node = document.querySelector(
      `#music-render [data-index="${dataIndex}"]`
    )
    if (!node) return
    console.log('reselecting previously selected element')
    node.dispatchEvent(new Event('mousedown', { bubbles: true }))
    node.dispatchEvent(new Event('mouseup', { bubbles: true }))
  }, [selectedAbcElem, abcString])

  const handleStringChange = e => {
    setAbcString(e.target.value)
  }

  const handleSave = async filename => {
    const resp = await Filesystem.writeFile({
      path: filename + '.abc',
      data: abcString,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    })
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
    const { data } = await Filesystem.readFile({
      path: selectedFile.uri,
      encoding: Encoding.UTF8,
    })
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
