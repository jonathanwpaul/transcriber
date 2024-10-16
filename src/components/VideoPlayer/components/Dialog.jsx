import {
    DialogTitle,
    List,
    ListItem,
    ListItemButton,
    Dialog as MuiDialog,
    Typography,
} from '@mui/material'

export const Dialog = ({
    open,
    onClose,
    children,
    otherProps
}) => {

    return (
        <MuiDialog onClose={onClose} open={open} {...otherProps}>
            {children}
        </MuiDialog>
    )
}
