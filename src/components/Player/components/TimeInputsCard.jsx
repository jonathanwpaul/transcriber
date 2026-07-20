import { Card } from '@components/ui'
import { TimeTextInput } from './TimeTextInput'

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
    <Card className='flex flex-col gap-2 p-4'>
      <div className='flex flex-col gap-3'>
        <div className='flex-1'>
          <TimeTextInput
            onChange={onLoopStartChange}
            changeAmount={0.1}
            disabled={controlsDisabled || !loopEnabled}
            label='loop start'
            min={0}
            max={duration}
            value={loopStart}
            accentColor='emerald'
          />
        </div>

        <div className='flex-1'>
          <TimeTextInput
            value={currentTime}
            disabled={controlsDisabled}
            onChange={onCurrentTimeChange}
            label='currently at'
            changeAmount={0.1}
            min={0}
            max={duration}
          />
        </div>

        <div className='flex-1'>
          <TimeTextInput
            value={loopEnd}
            disabled={controlsDisabled || !loopEnabled}
            onChange={onLoopEndChange}
            changeAmount={0.1}
            label='loop end'
            min={0}
            max={duration}
            accentColor='red'
          />
        </div>
      </div>
    </Card>
  )
}
