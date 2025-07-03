import { Card as MuiCard, Stack } from '@mui/material'

export const Card = ({ children, props }) => (
  <MuiCard>
    <Stack {...props}>{children}</Stack>
  </MuiCard>
)
