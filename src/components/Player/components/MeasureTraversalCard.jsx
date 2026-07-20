import { useState, useEffect } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button, Card, Input } from '@components/ui'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'

export function MeasureTraversalCard({
  bpm,
  beatsPerMeasure,
  measures,
  loopStart,
  loopEnd,
  currentTime,
  globalStart = null,
  onGlobalStartChange,
  onLoopEndChange,
  onSeek,
  showToast,
}) {
  const gs = globalStart ?? 0
  const secondsPerOneMeasure =
    bpm && beatsPerMeasure ? beatsPerMeasure / (bpm / 60) : 0
  const secondsPerMeasure = measures * secondsPerOneMeasure
  const currentLoopMeasures =
    secondsPerOneMeasure > 0 ? (loopEnd - loopStart) / secondsPerOneMeasure : 0
  const currentMeasure =
    secondsPerOneMeasure > 0 && currentTime >= gs
      ? Math.floor((currentTime - gs) / secondsPerOneMeasure) + 1
      : null

  const [localLoopMeasures, setLocalLoopMeasures] = useState(
    Math.round(currentLoopMeasures * 100) / 100,
  )
  const [localCurrentMeasure, setLocalCurrentMeasure] = useState(
    currentMeasure ?? '',
  )
  const [measureInputFocused, setMeasureInputFocused] = useState(false)

  useEffect(() => {
    setLocalLoopMeasures(Math.round(currentLoopMeasures * 100) / 100)
  }, [loopStart, loopEnd, bpm, beatsPerMeasure])

  useEffect(() => {
    if (!measureInputFocused) setLocalCurrentMeasure(currentMeasure ?? '')
  }, [currentMeasure, measureInputFocused])

  if (!bpm || !beatsPerMeasure) return null

  const handleLoopMeasuresBlur = e => {
    const val = parseFloat(e.target.value)
    if (isNaN(val) || val <= 0) {
      showToast?.('Measure count must be greater than 0')
      setLocalLoopMeasures(Math.round(currentLoopMeasures * 100) / 100)
      return
    }
    onLoopEndChange(loopStart + val * secondsPerOneMeasure)
  }

  const handleCurrentMeasureBlur = e => {
    setMeasureInputFocused(false)
    const val = parseInt(e.target.value, 10)
    if (isNaN(val) || val < 1) {
      setLocalCurrentMeasure(currentMeasure ?? '')
      return
    }
    onSeek(gs + (val - 1) * secondsPerOneMeasure)
  }

  const handleShorten = () => {
    if (measures >= currentLoopMeasures) {
      showToast?.('Step size exceeds loop length')
      return
    }
    onLoopEndChange(loopEnd - secondsPerMeasure)
  }

  const handleExtend = () => {
    onLoopEndChange(loopEnd + secondsPerMeasure)
  }

  return (
    <Card className='grid grid-cols-[1fr_2fr] items-center gap-x-4 gap-y-3 p-4'>
      <div className='text-xs font-medium text-foreground'>
        currently at measure
      </div>
      {globalStart === null ? (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => onGlobalStartChange?.(currentTime)}
        >
          Set global start
        </Button>
      ) : (
        <Input
          type='number'
          min={1}
          step={1}
          value={localCurrentMeasure}
          onChange={e => setLocalCurrentMeasure(e.target.value)}
          onFocus={() => setMeasureInputFocused(true)}
          onBlur={handleCurrentMeasureBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
        />
      )}

      <div className='text-xs font-medium text-foreground'>measure count</div>
      <div className='flex items-center gap-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={handleShorten}
            >
              <Minus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{`Shorten loop by ${measures} measures`}</TooltipContent>
        </Tooltip>

        <Input
          className='min-w-0 flex-1'
          type='number'
          value={localLoopMeasures}
          min={0.01}
          step={0.01}
          onChange={e => setLocalLoopMeasures(e.target.value)}
          onBlur={handleLoopMeasuresBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={handleExtend}
            >
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{`Extend loop by ${measures} measures`}</TooltipContent>
        </Tooltip>
      </div>
    </Card>
  )
}
