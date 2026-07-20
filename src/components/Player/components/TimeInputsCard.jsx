import { Card } from '@components/ui'
import { ScrubbableNumberInput } from './ScrubbableNumberInput'

const clampedChange = (onChange, min, max) => val => {
  if (Number.isNaN(val)) return
  if (min != null && val < min) return
  if (max != null && val > max) return
  onChange(val)
}

export function TimeInputsCard({
  loopStart,
  loopEnd,
  currentTime,
  duration,
  controlsDisabled,
  loopEnabled,
  onLoopStartChange,
  onLoopEndChange,
  onCurrentTimeChange,
}) {
  return (
    <Card className='grid grid-cols-[1fr_2fr] items-center gap-x-4 gap-y-3 p-4'>
      <div className='text-xs font-medium text-foreground'>loop start</div>
      <ScrubbableNumberInput
        value={loopStart}
        disabled={controlsDisabled || !loopEnabled}
        onChange={clampedChange(onLoopStartChange, 0, duration)}
        step={0.1}
        min={0}
        max={duration}
        accentColor='emerald'
      />

      <div className='text-xs font-medium text-foreground'>current time</div>
      <ScrubbableNumberInput
        value={currentTime}
        disabled={controlsDisabled}
        onChange={clampedChange(onCurrentTimeChange, 0, duration)}
        step={0.1}
        min={0}
        max={duration}
      />

      <div className='text-xs font-medium text-foreground'>loop end</div>
      <ScrubbableNumberInput
        value={loopEnd}
        disabled={controlsDisabled || !loopEnabled}
        onChange={clampedChange(onLoopEndChange, 0, duration)}
        step={0.1}
        min={0}
        max={duration}
        accentColor='red'
      />
    </Card>
  )
}
