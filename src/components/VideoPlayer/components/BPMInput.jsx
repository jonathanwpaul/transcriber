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

    // If the last tap was within the last 10s, include this interval in the
    // running average; otherwise start fresh.
    if (lastTap && lastTap > now - 10000) {
      const interval = now - lastTap

      // Mobile can sometimes fire duplicate click/tap events very close
      // together; ignore anything unrealistically fast so it doesn't
      // double the detected BPM.
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
      // First tap or after a long pause: reset intervals so the next tap sets
      // a clean starting point for averaging.
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
        <div className='flex h-full flex-col items-center justify-between gap-1'>
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

          <div className='h-3 flex items-center justify-center'>
            {bpm ? (
              <div
                className='bpm-dot h-2 w-2 rounded-full bg-pink-500'
                style={{ animationDuration: `${60000 / bpm}ms` }}
              />
            ) : (
              <div className='h-2 w-2 rounded-full bg-muted opacity-40' />
            )}
          </div>
        </div>

        <div className='flex w-full items-stretch gap-3'>
          <div className='flex w-full flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <div className='w-24 text-xs font-medium text-muted-foreground'>
                beats/min
              </div>
              <div className='flex-1'>
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
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-24 text-xs font-medium text-muted-foreground'>
                beats/measure
              </div>
              <div className='flex-1'>
                <ScrubbableNumberInput
                  value={beatsPerMeasure ?? ''}
                  onChange={handleBeatsPerMeasureChange}
                  step={1}
                  min={1}
                />
              </div>
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
