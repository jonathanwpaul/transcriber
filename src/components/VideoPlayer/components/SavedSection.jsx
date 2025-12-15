import { useState } from 'react'
import { Trash2 } from 'lucide-react'

import { timestampFormatter } from '@utils/video'

import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { Input } from '@components/ui/input'

const SavedSection = ({
  onClick,
  onDelete,
  startTime,
  endTime,
  isSelected,
  title,
  onTitleChange,
}) => {
  const [currentTitle, setCurrentTitle] = useState(title || '')

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
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <div className="shrink-0 text-xs text-muted-foreground">
          {timestampFormatter(startTime)} - {timestampFormatter(endTime)}
        </div>

        <div className="min-w-0 flex-1" onClick={e => e.stopPropagation()}>
          <Input
            value={currentTitle}
            onChange={handleTitleChange}
            placeholder="title"
          />
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={e => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label="Delete loop"
        >
          <Trash2 />
        </Button>
      </button>
    </Card>
  )
}

export default SavedSection
