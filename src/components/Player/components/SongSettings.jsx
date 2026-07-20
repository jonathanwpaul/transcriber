import { ChevronLeft } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { BPMInput } from './BPMInput'
import { EqualizerCard } from './EqualizerCard'

export function SongSettings({
  onClose,
  type,
  bpm,
  beatsPerMeasure,
  onBpmChange,
  onBeatsPerMeasureChange,
  globalStart = null,
  onGlobalStartChange,
  gains,
  onBandChange,
  activePreset,
  onPresetChange,
  playerRef,
  hideHeader = false,
  asDialog = false,
  open = false,
  onOpenChange,
  showVideo = true,
  onShowVideoChange,
}) {
  const content = (
    <div className='flex flex-col gap-2'>
      {!hideHeader && (
        <div className='flex items-center gap-2 py-1'>
          <Button variant='ghost' size='icon' onClick={onClose} aria-label='Back'>
            <ChevronLeft />
          </Button>
          <span className='text-sm font-semibold'>Song Settings</span>
        </div>
      )}

      <Card className='flex flex-col gap-3 p-4'>
        <div className='text-xs font-medium text-muted-foreground'>Rhythm</div>
        <BPMInput
          value={bpm}
          onChange={onBpmChange}
          beatsPerMeasure={beatsPerMeasure}
          onBeatsPerMeasureChange={onBeatsPerMeasureChange}
        />
        <Button
          variant='outline'
          size='sm'
          disabled={globalStart === null}
          onClick={() => onGlobalStartChange?.(null)}
        >
          Reset global start
        </Button>
      </Card>

      <Card className='flex items-center justify-between gap-3 p-4'>
        <span className='text-sm font-medium'>Show video</span>
        <Button
          variant='ghost'
          size='sm'
          className={`relative h-6 w-11 rounded-full p-0 ${
            showVideo ? 'bg-primary' : 'bg-muted'
          }`}
          role='switch'
          aria-checked={showVideo}
          aria-label='Show video'
          onClick={() => onShowVideoChange?.(!showVideo)}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full transition-transform ${
              showVideo ? 'left-6 bg-background' : 'left-1 bg-muted-foreground'
            }`}
          />
        </Button>
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

  if (!asDialog) return content

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Song Settings</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
