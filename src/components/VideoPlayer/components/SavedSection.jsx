import { useState } from 'react'
import { Delete } from '@mui/icons-material'
import {
  Card,
  IconButton,
  ListItemButton,
  TextField,
  useTheme,
} from '@mui/material'
import { timestampFormatter } from '@utils/video'

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
  const theme = useTheme()

  const handleTitleChange = e => {
    const newTitle = e.target.value
    setCurrentTitle(newTitle)
    onTitleChange(newTitle)
  }

  return (
    <Card style={{ flex: 1, margin: '1rem' }}>
      <ListItemButton
        className='horizontal-container'
        onClick={onClick}
        sx={{
          gap: '1rem',
          height: '100%',
          justifyContent: 'space-between',
          '&.Mui-selected': {
            backgroundColor: theme.palette.grey[900],
            // color: theme.palette.background.paper,
            '&:hover': {
              backgroundColor: theme.palette.grey[900],
            },
          },
          '&:hover': {
            backgroundColor: theme.palette.grey[900],
          },
        }}
        selected={isSelected}
      >
        <p>{`${timestampFormatter(startTime)} - ${timestampFormatter(
          endTime,
        )}`}</p>
        <TextField
          value={currentTitle}
          onChange={handleTitleChange}
          onClick={e => e.stopPropagation()}
          variant='outlined'
          size='small'
          style={{ flexGrow: 1 }}
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
