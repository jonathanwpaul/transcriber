import React, { useState, useRef } from 'react'
import { IconButton, TextField, Tooltip } from '@mui/material'
import { Add, Remove } from '@mui/icons-material'
import { ReactComponent as MetronomeIcon } from '../../../assets/metronome.svg' // Import the metronome SVG

const BPMInput = ({ value, onChange }) => {
  const [bpm, setBpm] = useState(value)
  const [lastTap, setLastTap] = useState(null)
  const [tapIntervals, setTapIntervals] = useState([])
  const inputRef = useRef()

  const handleTap = () => {
    const now = Date.now()
    if (lastTap) {
      const interval = now - lastTap
      setTapIntervals([...tapIntervals, interval])
      const averageInterval =
        tapIntervals.reduce((a, b) => a + b, 0) / tapIntervals.length
      const newBpm = Math.round(60000 / averageInterval)
      setBpm(newBpm)
      onChange(newBpm)
    }
    setLastTap(now)
  }

  const handleIncrement = () => {
    const newBpm = bpm + 1
    setBpm(newBpm)
    onChange(newBpm)
  }

  const handleDecrement = () => {
    const newBpm = bpm - 1
    setBpm(newBpm)
    onChange(newBpm)
  }

  const handleChange = e => {
    const newBpm = parseInt(e.target.value, 10)
    if (!isNaN(newBpm)) {
      setBpm(newBpm)
      onChange(newBpm)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        className='vertical-container'
        style={{ flexDirection: 'column', flex: 1, alignItems: 'center' }}
      >
        <Tooltip title='Tap to set BPM'>
          <IconButton onClick={handleTap}>
            <MetronomeIcon height={25} width={25} />
          </IconButton>
        </Tooltip>
        <Tooltip title='Increase BPM'>
          <IconButton onClick={handleIncrement}>
            <Add />
          </IconButton>
        </Tooltip>
        <TextField
          type='number'
          value={bpm}
          onChange={handleChange}
          inputRef={inputRef}
          style={{ width: 80 }}
        />
        <Tooltip title='Decrease BPM'>
          <IconButton onClick={handleDecrement}>
            <Remove />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  )
}

export default BPMInput
