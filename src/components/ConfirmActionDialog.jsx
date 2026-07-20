import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

export function ConfirmActionDialog({
  open,
  onOpenChange,
  action,
  songs = [],
  targetFolder,
  onConfirm,
}) {
  const count = songs.length
  const s = count !== 1 ? 's' : ''

  const message =
    action === 'move'
      ? `You are about to move ${count} song${s} to "${targetFolder?.name}".`
      : `You are about to delete ${count} song${s}.`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>
            {action === 'move' ? 'Move songs?' : 'Delete songs?'}
          </DialogTitle>
        </DialogHeader>
        <p className='text-sm text-muted-foreground'>{message}</p>
        <div className='flex justify-end gap-2 pt-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={action === 'delete' ? 'destructive' : 'default'}
            onClick={onConfirm}
          >
            {action === 'move' ? 'Move' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
