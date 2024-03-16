import {
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  Dialog as MuiDialog,
  Typography,
} from '@mui/material'

export const FileDialog = ({
  open,
  onClose,
  selectedValue,
  items,
  ...otherProps
}) => {
  const handleClose = () => {
    onClose(selectedValue)
  }

  const handleListItemClick = value => {
    onClose(value)
  }

  return (
    <MuiDialog onClose={handleClose} open={open} {...otherProps}>
      <DialogTitle>Saved entries:</DialogTitle>
      <List>
        {items.map(item => (
          <ListItem onClick={() => handleListItemClick(item)}>
            {/* name, mtime, size */}
            <ListItemButton
              className='vertical-container'
              style={{ alignItems: 'flex-start' }}
            >
              <Typography>{item.name}</Typography>
              <Typography variant='body'>
                {'Modified: ' + new Date(item.mtime).toLocaleString()}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </MuiDialog>
  )
}
