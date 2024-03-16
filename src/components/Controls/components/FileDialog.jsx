import {
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  Dialog as MuiDialog,
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
            <ListItemButton>{JSON.stringify(item)}</ListItemButton>
          </ListItem>
        ))}
      </List>
    </MuiDialog>
  )
}
