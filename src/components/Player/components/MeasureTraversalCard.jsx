import { ArrowBigLeftDash, ArrowBigRightDash } from 'lucide-react'
import { Button, Card } from '@components/ui'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'
import { ScrubbableNumberInput } from './ScrubbableNumberInput'

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
          <ScrubbableNumberInput
            value={measures}
            onChange={val => onMeasuresChange(parseInt(val, 10) || 0)}
            step={1}
            min={1}
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
