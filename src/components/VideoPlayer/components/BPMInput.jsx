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

export const BPMInput = ({
  value,
  onChange,
  beatsPerMeasure,
  onBeatsPerMeasureChange,
}) => {
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
      <div className='flex gap-4 h-full items-stretch justify-center md:justify-start'>
        <div className='h-full'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className='h-full w-20'
                type='button'
                variant='secondary'
                onClick={handleTap}
              >
                <MetronomeIcon className='fill-white' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tap to set BPM</TooltipContent>
          </Tooltip>
        </div>

        <div className='grid w-full grid-cols-2 gap-2'>
          <div className='col-span-2'>
            <div className='mb-1 text-xs font-medium text-muted-foreground'>
              beats/min
            </div>
            <Input type='number' value={bpm ?? ''} onChange={handleBpmChange} />
          </div>
          <div className='col-span-2'>
            <div className='mb-1 text-xs font-medium text-muted-foreground'>
              beats/measure
            </div>
            <Input
              type='number'
              value={beatsPerMeasure ?? ''}
              onChange={handleBeatsPerMeasureChange}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
