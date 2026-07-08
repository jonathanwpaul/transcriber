import { ChevronLeft } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { BPMInput } from './BPMInput'
import { EqualizerCard } from './EqualizerCard'

export function SongSettings({
  onClose,
  type,
  bpm,
  beatsPerMeasure,
  onBpmChange,
  onBeatsPerMeasureChange,
  gains,
  onBandChange,
  activePreset,
  onPresetChange,
  playerRef,
}) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2 py-1'>
        <Button variant='ghost' size='icon' onClick={onClose} aria-label='Back'>
          <ChevronLeft />
        </Button>
        <span className='text-sm font-semibold'>Song Settings</span>
      </div>

      <Card className='flex flex-col gap-3 p-4'>
        <div className='text-xs font-medium text-muted-foreground'>Rhythm</div>
        <BPMInput
          value={bpm}
          onChange={onBpmChange}
          beatsPerMeasure={beatsPerMeasure}
          onBeatsPerMeasureChange={onBeatsPerMeasureChange}
        />
      </Card>

      {type === 'file' && (
        <EqualizerCard
          gains={gains}
          onBandChange={onBandChange}
          activePreset={activePreset}
          onPresetChange={onPresetChange}
          playerRef={playerRef}
        />
      )}
    </div>
  )
}
