import { Delete } from '@mui/icons-material'
import { Card, IconButton, ListItemButton } from '@mui/material'
import { timestampFormatter } from 'utils/timestampFormatter'

const SavedSection = ({ onClick, onDelete, startTime, endTime, isSelected }) => {
  return (
    <Card>
      <ListItemButton
        className='horizontal-container' onClick={onClick}>
        <p>{`${timestampFormatter(startTime)} - ${timestampFormatter(endTime)}`}</p>
        <IconButton ><Delete onClick={onDelete} /></IconButton>
      </ListItemButton>

    </Card>
  )
}
export default SavedSection
