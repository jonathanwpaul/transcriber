import { useState } from 'react'
import { ChevronRight, Trash2 } from 'lucide-react'

import { timestampFormatter } from '@utils/video'

import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { Input } from '@components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'

export const SavedSection = ({
  onClick,
  onDelete,
  startTime,
  endTime,
  isSelected,
  title,
  onTitleChange,
  hasChildren,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [currentTitle, setCurrentTitle] = useState(title || '')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleTitleChange = e => {
    const newTitle = e.target.value
    setCurrentTitle(newTitle)
    onTitleChange(newTitle)
  }

  return (
    <Card
      className={
        'mx-2 my-2 transition-colors ' +
        (isSelected ? 'border-primary bg-accent' : 'hover:bg-accent')
      }
    >
      <div
        onClick={onClick}
        role='button'
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') onClick()
        }}
        className='flex w-full items-center gap-2 p-3 text-left'
      >
        <div>
          {hasChildren && (
            <Button
              type='button'
              size='icon'
              variant='outline'
              className='h-8 w-8 bg-interactives shadow-sm'
              onClick={e => {
                e.stopPropagation()
                onToggleCollapse?.()
              }}
              aria-label={isCollapsed ? 'Expand children' : 'Collapse children'}
            >
              <ChevronRight
                className={
                  'h-4 w-4 transition-transform ' +
                  (isCollapsed ? '' : 'rotate-90')
                }
              />
            </Button>
          )}
        </div>

        <div className='min-w-0 flex-1' onClick={e => e.stopPropagation()}>
          <Input
            className='border-muted'
            onChange={handleTitleChange}
            placeholder={`${timestampFormatter(startTime)} - ${timestampFormatter(endTime)}`}
            value={currentTitle}
          />
        </div>

        <Button
          type='button'
          size='icon'
          variant='outline'
          onClick={e => {
            e.stopPropagation()
            setConfirmOpen(true)
          }}
          aria-label='Delete loop'
        >
          <Trash2 />
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete loop?</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-muted-foreground'>
            This cannot be undone.
          </p>
          <div className='flex justify-end gap-2 pt-2'>
            <Button variant='outline' onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                setConfirmOpen(false)
                onDelete()
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
