import {
  IconButton,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { useCallback, useState } from 'react'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Preferences } from '@capacitor/preferences'
import { FolderOpen, Save, SaveAs } from '@mui/icons-material'
import { FileDialog } from './FileDialog'
import { SaveAsDialog } from './SaveAsDialog'

const SaveLoadControls = ({ abcString, setAbcString }) => {
  const [fileDialogOpen, setFileDialogOpen] = useState()
  const [saveDialogOpen, setSaveDialogOpen] = useState()
  const [saves, setSaves] = useState([])
  const [toastMessage, setToastMessage] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

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

  const loadSave = useCallback(
    async selectedFile => {
      const { data } = await Filesystem.readFile({
        path: selectedFile.uri,
        encoding: Encoding.UTF8,
      })
      setAbcString(data)
      setToastMessage(`file loaded from ${selectedFile.uri}!`)
      setToastOpen(true)
    },
    [setAbcString]
  )

  return (
    <>
      <ToggleButtonGroup>
        <ToggleButton disabled onClick={() => setSaveDialogOpen(true)}>
          <Save />
        </ToggleButton>
        <ToggleButton onClick={() => setSaveDialogOpen(true)}>
          <SaveAs />
        </ToggleButton>
        <ToggleButton
          onClick={() => {
            getSaves()
            setFileDialogOpen(true)
          }}
        >
          <FolderOpen />
        </ToggleButton>
      </ToggleButtonGroup>
      <FileDialog
        open={fileDialogOpen}
        onClose={file => {
          file && loadSave(file)
          setFileDialogOpen(false)
        }}
        items={saves}
        fullWidth
        maxWidth='md'
      />
      <SaveAsDialog
        open={saveDialogOpen}
        onClose={filename => {
          filename && handleSave(filename)
          setSaveDialogOpen(false)
        }}
        fullWidth
        maxWidth='md'
      />
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        color='primary'
        open={toastOpen}
        // autoHideDuration={2000}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
      />
    </>
  )
}

export default SaveLoadControls
