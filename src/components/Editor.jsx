import { Card, TextField, Snackbar, SnackbarContent } from '@mui/material'
import { Controls, MusicRender } from './'
import { Profiler, useCallback, useEffect, useState } from 'react'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

export const Editor = () => {
  const [SCALE, setSCALE] = useState(1)
  const [selectedAbcElem, setSelectedAbcElem] = useState()
  const [duration, setDuration] = useState(1 / 4)
  const [inputMode, setInputMode] = useState('note')
  const [abcString, setAbcString] = useState('ddddddd')
  const [saves, setSaves] = useState([])
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  console.log(SCALE)
  const handleStringChange = e => {
    setAbcString(e.target.value)
  }

  const handleSave = useCallback(
    async filename => {
      const resp = await Filesystem.writeFile({
        path: filename + '.abc',
        data: abcString,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      })
      setToastMessage(`file saved to ${resp.uri}!`)
      setToastOpen(true)
    },
    [abcString]
  )

  const getSaves = useCallback(async () => {
    const resp = await Filesystem.readdir({
      path: '',
      directory: Directory.Data,
    })
    setSaves(resp.files)
  }, [])

  const loadSave = useCallback(async selectedFile => {
    const { data } = await Filesystem.readFile({
      path: selectedFile.uri,
      encoding: Encoding.UTF8,
    })
    setAbcString(data)
    setToastMessage(`file loaded from ${selectedFile.uri}!`)
    setToastOpen(true)
  }, [])

  const renderProps = {
    selectedAbcElem,
    setSelectedAbcElem,
    SCALE,
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
    setSCALE,
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
      <Profiler
        id='test1'
        onRender={(id, phase, actualDuration) => {
          console.log({ phase, actualDuration })
        }}
      >
        <MusicRender {...renderProps} />
      </Profiler>
      <Card elevation={5} className='editor-inputs'>
        <TextField
          fullWidth
          multiline
          onChange={handleStringChange}
          value={abcString}
          InputProps={{ style: { height: '100%' } }}
          maxRows={5}
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
