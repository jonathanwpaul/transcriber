import React, { useEffect, useState } from 'react'
import { Check, Pointer } from 'lucide-react'

import { Button } from '@components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'
import { Input } from '@components/ui'

export const BPMInput = ({
  value,
  onChange,
  beatsPerMeasure,
  onBeatsPerMeasureChange,
  onSubmit,
}) => {
  const [bpm, setBpm] = useState(value)
  const [lastTap, setLastTap] = useState(null)
  const [tapIntervals, setTapIntervals] = useState([])

  // Keep local BPM state in sync when the parent value changes (e.g. from
  // persisted JSON) so the input shows the correct value on load.
  useEffect(() => {
    if (typeof value === 'number' && value !== bpm) {
      setBpm(value)
    }
  }, [value, bpm])

  const handleTap = () => {
    const now = Date.now()

    if (lastTap && lastTap > now - 10000) {
      const interval = now - lastTap

      const MIN_INTERVAL_MS = 150
      if (interval < MIN_INTERVAL_MS) {
        setLastTap(now)
        return
      }

      const nextIntervals = [...tapIntervals, interval].slice(-8) // keep last 8

      setTapIntervals(nextIntervals)

      const total = nextIntervals.reduce((a, b) => a + b, 0)
      const averageInterval = total / nextIntervals.length

      if (averageInterval > 0) {
        const newBpm = Math.round(60000 / averageInterval)
        setBpm(newBpm)
        onChange(newBpm)
      }
    } else {
      setTapIntervals([])
    }

    setLastTap(now)
  }

  return (
    <TooltipProvider>
      <div className='flex h-full items-center gap-3 md:justify-start'>
        {/* Numeric inputs on the left */}
        <div className='flex w-full flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <div className='w-24 text-xs font-medium text-muted-foreground'>
              beats/min
            </div>
            <div className='flex-1'>
              <Input
                type='number'
                value={bpm}
                min={0}
                onChange={e => {
                  const val = parseInt(e.target.value, 10) || 0
                  setBpm(val)
                  onChange(val)
                }}
              />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-24 text-xs font-medium text-muted-foreground'>
              beats/measure
            </div>
            <div className='flex-1'>
              <Input
                type='number'
                value={beatsPerMeasure}
                min={1}
                onChange={e => onBeatsPerMeasureChange(parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>
        </div>

        {/* Tap button to the right of inputs, flashing at the current BPM */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              className={`self-stretch h-auto w-24 p-0 ${bpm ? 'bpm-button-pulse' : ''}`}
              style={
                bpm
                  ? {
                      animationDuration: `${60000 / bpm}ms`,
                    }
                  : undefined
              }
              onClick={handleTap}
            >
              <Pointer className='h-12 w-12' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tap to set BPM</TooltipContent>
        </Tooltip>

        {/* Lock-in button on the far right */}
        {onSubmit && (
          <div className='flex items-center'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={onSubmit}
                  aria-label='Lock in BPM and beats/measure'
                >
                  <Check className='text-green-500' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lock in BPM &amp; beats/measure</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
