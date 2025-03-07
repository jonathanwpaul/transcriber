import { useState } from 'react'
import './App.css'
import { Player } from './components'
import { Snackbar } from '@mui/material'

function App() {
  const [toastMessage, setToastMessage] = useState()
  const [toastOpen, setToastOpen] = useState(false)
  return (
    <div className='App'>
      <Snackbar
        open={toastOpen}
        color={'primary'}
        autoHideDuration={5000}
        message={toastMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />

      <Player
        showToast={message => {
          setToastMessage(message)
          setToastOpen(true)
        }}
      />
    </div>
  )
}

export default App
