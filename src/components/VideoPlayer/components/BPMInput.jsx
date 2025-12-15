import React, { useState } from 'react'
import { ReactComponent as MetronomeIcon } from '../../../assets/icons/metronome.svg'

import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'

const BPMInput = ({ value, onChange, beatsPerMeasure, onBeatsPerMeasureChange }) => {
  const [bpm, setBpm] = useState(value)
  const [lastTap, setLastTap] = useState(null)
  const [tapIntervals, setTapIntervals] = useState([])

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
    <TooltipProvider>
      <div className="flex flex-col items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" onClick={handleTap}>
              <MetronomeIcon className="h-10 w-10 fill-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tap to set BPM</TooltipContent>
        </Tooltip>

        <div className="grid w-full grid-cols-2 gap-2">
          <div className="col-span-2">
            <div className="mb-1 text-xs font-medium text-muted-foreground">beats/min</div>
            <Input type="number" value={bpm ?? ''} onChange={handleBpmChange} />
          </div>
          <div className="col-span-2">
            <div className="mb-1 text-xs font-medium text-muted-foreground">beats/measure</div>
            <Input
              type="number"
              value={beatsPerMeasure ?? ''}
              onChange={handleBeatsPerMeasureChange}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default BPMInput
