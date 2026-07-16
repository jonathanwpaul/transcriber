import { Flag, Repeat, Save } from 'lucide-react'

import { Button, Card } from '@components/ui'

export function LoopControlsCard({
  loopEnabled,
  onLoopEnabledChange,
  onMarkLoopStart,
  onSaveLoop,
  onMarkLoopEnd,
}) {
  return (
    <Card className='flex flex-col gap-3 p-4'>
      <div className='flex gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='flex-1'
          aria-label='Mark loop start'
          onClick={onMarkLoopStart}
        >
          <Flag className='text-emerald-500' />
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='flex-1'
          aria-label='Save loop'
          onClick={onSaveLoop}
        >
          <Save />
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='flex-1'
          aria-label='Mark loop end'
          onClick={onMarkLoopEnd}
        >
          <Flag className='text-red-500' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          className={`flex-1 ${loopEnabled ? 'text-primary' : 'text-muted-foreground'}`}
          role='switch'
          aria-checked={loopEnabled}
          aria-label={loopEnabled ? 'Disable loop playback' : 'Enable loop playback'}
          onClick={() => onLoopEnabledChange(!loopEnabled)}
        >
          <Repeat />
        </Button>
      </div>
    </Card>
  )
}
