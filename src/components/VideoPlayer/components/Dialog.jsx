import { Dialog as MuiDialog } from '@mui/material'

export const Dialog = ({ open, onClose, children, otherProps }) => {
  return (
    <MuiDialog onClose={onClose} open={open} {...otherProps}>
      {children}
    </MuiDialog>
  )
}
