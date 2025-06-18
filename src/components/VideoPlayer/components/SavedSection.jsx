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
    <Card style={{ flex: 1, height: '50px', margin: '5px' }}>
      <ListItemButton
        className='horizontal-container'
        onClick={onClick}
        style={{
          height: '100%',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
        sx={{
          '&.Mui-selected': {
            backgroundColor: theme.palette.grey[900],
            // color: theme.palette.background.paper,
            '&:hover': {
              backgroundColor: theme.palette.grey[900],
            }
          },
          '&:hover': {
            backgroundColor: theme.palette.grey[900],
          }
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
