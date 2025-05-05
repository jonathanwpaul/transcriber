import { useState } from 'react'
import './App.css'
import { Player } from './components'
import { Snackbar, ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from './theme'

function App() {
  const [toastMessage, setToastMessage] = useState()
  const [toastOpen, setToastOpen] = useState(false)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className='App'>
        <Snackbar
          open={toastOpen}
          color='primary'
          autoHideDuration={2000}
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
    </ThemeProvider>
  )
}

export default App
