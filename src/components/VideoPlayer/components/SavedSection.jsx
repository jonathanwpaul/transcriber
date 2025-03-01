import { useState } from 'react'
import { Delete } from '@mui/icons-material'
import { Card, IconButton, ListItemButton, TextField } from '@mui/material'
import { timestampFormatter } from 'utils/timestampFormatter'

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
    <Card style={{ flex: 1, height: '50px', margin: '5px' }}>
      <ListItemButton
        className='horizontal-container'
        onClick={onClick}
        style={{
          height: '100%',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
        selected={isSelected}
      >
        <p>{`${timestampFormatter(startTime)} - ${timestampFormatter(
          endTime
        )}`}</p>
        <TextField
          value={currentTitle}
          onChange={handleTitleChange}
          onClick={e => e.stopPropagation()}
          variant='outlined'
          size='small'
          style={{ flexGrow: 1, marginLeft: '10px', marginRight: '10px' }}
        />
        <IconButton>
          <Delete
            onClick={e => {
              e.stopPropagation()
              onDelete()
            }}
          />
        </IconButton>
      </ListItemButton>
    </Card>
  )
}

export default SavedSection
