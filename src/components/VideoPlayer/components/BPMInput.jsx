import React, { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { ReactComponent as MetronomeIcon } from '../../../assets/icons/metronome.svg'

import { Button } from '@components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'
import { ScrubbableNumberInput } from './ScrubbableNumberInput'

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

  const handleBeatsPerMeasureChange = newBeatsPerMeasure => {
    if (typeof newBeatsPerMeasure !== 'number') return
    if (Number.isNaN(newBeatsPerMeasure)) return
    onBeatsPerMeasureChange(newBeatsPerMeasure)
  }

  return (
    <TooltipProvider>
      <div className='flex h-full items-stretch justify-center gap-4 md:justify-start'>
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

        <div className='flex w-full items-stretch gap-3'>
          <div className='grid w-full grid-cols-2 gap-2'>
            <div className='col-span-2'>
              <div className='mb-1 text-xs font-medium text-muted-foreground'>
                beats/min
              </div>
              <ScrubbableNumberInput
                value={bpm ?? ''}
                onChange={val => {
                  setBpm(val)
                  onChange(val)
                }}
                step={1}
                min={0}
              />
            </div>
            <div className='col-span-2'>
              <div className='mb-1 text-xs font-medium text-muted-foreground'>
                beats/measure
              </div>
              <ScrubbableNumberInput
                value={beatsPerMeasure ?? ''}
                onChange={handleBeatsPerMeasureChange}
                step={1}
                min={1}
              />
            </div>
          </div>

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
      </div>
    </TooltipProvider>
  )
}
