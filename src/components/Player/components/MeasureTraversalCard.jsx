import { useState, useEffect } from 'react'
import { ArrowBigLeftDash, ArrowBigRightDash } from 'lucide-react'
import { Button, Card, Input } from '@components/ui'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'

export function MeasureTraversalCard({
  bpm,
  beatsPerMeasure,
  measures,
  loopStart,
  loopEnd,
  onLoopStartChange,
  onLoopEndChange,
  onSeek,
  onMeasuresChange,
}) {
  const [localMeasures, setLocalMeasures] = useState(measures ?? '')

  useEffect(() => {
    if (typeof measures === 'number' && measures !== Number(localMeasures)) setLocalMeasures(measures)
  }, [measures])

  if (!bpm || !beatsPerMeasure) return null

  const secondsPerMeasure = (measures * beatsPerMeasure) / (bpm / 60)

  return (
    <Card className='flex flex-col gap-4 p-4'>
      <div className='flex gap-3 items-end sm:gap-4'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='lg'
              onClick={() => {
                const newStart = Math.round(loopStart - secondsPerMeasure)
                onLoopEndChange(loopStart)
                onLoopStartChange(newStart)
                onSeek(newStart)
              }}
            >
              <ArrowBigLeftDash />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{`Previous ${measures} measures`}</TooltipContent>
        </Tooltip>

        <div className='w-full'>
          <Input
            type='number'
            value={localMeasures}
            min={1}
            onChange={e => setLocalMeasures(e.target.value)}
            onBlur={e => {
              const val = Math.max(1, parseInt(e.target.value, 10) || 1)
              setLocalMeasures(val)
              onMeasuresChange(val)
            }}
            onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
          />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='lg'
              onClick={() => {
                const newEnd = Math.round(loopEnd + secondsPerMeasure)
                onLoopStartChange(loopEnd)
                onSeek(loopEnd)
                onLoopEndChange(newEnd)
              }}
            >
              <ArrowBigRightDash />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{`Next ${measures} measures`}</TooltipContent>
        </Tooltip>
      </div>
    </Card>
  )
}
