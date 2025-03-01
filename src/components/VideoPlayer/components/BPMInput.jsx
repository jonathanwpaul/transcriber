import React, { useState, useRef } from 'react'
import { IconButton, TextField, Tooltip } from '@mui/material'
import { ReactComponent as MetronomeIcon } from '../../../assets/metronome.svg' // Import the metronome SVG

const BPMInput = ({
  value,
  onChange,
  beatsPerMeasure,
  onBeatsPerMeasureChange,
}) => {
  const [bpm, setBpm] = useState(value)
  const [lastTap, setLastTap] = useState(null)
  const [tapIntervals, setTapIntervals] = useState([])
  const inputRef = useRef()

  const handleTap = () => {
    const now = Date.now()
    if (lastTap && lastTap > now - 10000) {
      const interval = now - lastTap
      setTapIntervals([...tapIntervals, interval])
      const averageInterval =
        tapIntervals.reduce((a, b) => a + b, 0) / tapIntervals.length
      const newBpm = Math.round(60000 / averageInterval)
      setBpm(newBpm)
      onChange(newBpm)
    } else {
      setTapIntervals([])
    }
    setLastTap(now)
  }

  const handleBpmChange = e => {
    const newBpm = parseInt(e.target.value, 10)
    if (!isNaN(newBpm)) {
      setBpm(newBpm)
      onChange(newBpm)
    }
  }

  const handleBeatsPerMeasureChange = e => {
    const newBeatsPerMeasure = parseInt(e.target.value, 10)
    if (!isNaN(newBeatsPerMeasure)) {
      onBeatsPerMeasureChange(newBeatsPerMeasure)
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
            <MetronomeIcon height={50} width={50} />
          </IconButton>
        </Tooltip>
        <TextField
          type='number'
          label='beats/min'
          value={bpm}
          onChange={handleBpmChange}
          inputRef={inputRef}
          style={{ width: 120 }}
        />
        <TextField
          type='number'
          label='beats/measure'
          value={beatsPerMeasure}
          onChange={handleBeatsPerMeasureChange}
          style={{ width: 120, marginTop: '10px' }}
        />
      </div>
    </div>
  )
}

export default BPMInput
