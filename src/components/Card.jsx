import { Card as MuiCard, Stack, useTheme } from '@mui/material'

export const Card = ({ children, ...props }) => {
  const theme = useTheme()
  console.log(props)
  return (
    <MuiCard
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.primary.main}`,
        padding: '2rem',
        borderRadius: '1rem',
      }}
      {...props}
    >
      {children}
    </MuiCard>
  )
}
