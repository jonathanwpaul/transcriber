import { Delete } from '@mui/icons-material'
import { Card, IconButton, ListItemButton } from '@mui/material'
import { timestampFormatter } from 'utils/timestampFormatter'

const SavedSection = ({ onClick, onDelete, startTime, endTime, isSelected }) => {
  return (
    <Card style={{ flexShrink: 0, height: '50px', margin: '5px' }}>
      <ListItemButton
        className='horizontal-container' onClick={onClick} style={{ height: '100%', justifyContent: 'space-between' }}>
        <p>{`${timestampFormatter(startTime)} - ${timestampFormatter(endTime)}`}</p>
        <IconButton ><Delete onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }} /></IconButton>
      </ListItemButton>

    </Card>
  )
}
export default SavedSection
