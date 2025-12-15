import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Home } from './components/Home'

function App() {
  const [toastMessage, setToastMessage] = useState()
  const [toastOpen, setToastOpen] = useState(false)

  const [themeMode, setThemeMode] = useState(() => {
    const stored = window.localStorage.getItem('themeMode')
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (themeMode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    window.localStorage.setItem('themeMode', themeMode)
  }, [themeMode])

  const showToast = useMemo(
    () =>
      message => {
        setToastMessage(message)
        setToastOpen(true)
        window.setTimeout(() => setToastOpen(false), 2000)
      },
    [],
  )

  return (
    <div className='App'>
      {toastOpen && (
        <div className="fixed top-3 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border bg-card px-4 py-2 text-sm text-card-foreground shadow-lg">
          {toastMessage}
        </div>
      )}

      <Home
        showToast={showToast}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />
    </div>
  )
}

export default App
