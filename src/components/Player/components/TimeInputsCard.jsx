import { Card } from '@components/ui'
import { TimeTextInput } from './TimeTextInput'

export function TimeInputsCard({
  loopStart,
  loopEnd,
  currentTime,
  duration,
  controlsDisabled,
  onLoopStartChange,
  onLoopEndChange,
  onCurrentTimeChange,
}) {
  return (
    <Card className='flex flex-col gap-2 p-4'>
      <div className='flex flex-col gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex-1'>
            <TimeTextInput
              onChange={onLoopStartChange}
              changeAmount={0.1}
              disabled={controlsDisabled}
              label='start'
              min={0}
              max={duration}
              value={loopStart}
            />
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex-1'>
            <TimeTextInput
              value={currentTime}
              disabled={controlsDisabled}
              onChange={onCurrentTimeChange}
              label='current'
              changeAmount={0.1}
              min={0}
              max={duration}
            />
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex-1'>
            <TimeTextInput
              value={loopEnd}
              disabled={controlsDisabled}
              onChange={onLoopEndChange}
              changeAmount={0.1}
              label='end'
              min={0}
              max={duration}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
