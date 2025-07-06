import { Divider, Stack as MuiStack } from '@mui/material'

export const Stack = ({ children, divider, column, ...props }) => {
  return (
    <MuiStack
      divider={
        divider && (
          <Divider flexItem orientation={column ? 'horizontal' : 'vertical'} />
        )
      }
      direction={column ? 'column' : { md: 'row', sm: 'column' }}
      gap='5rem'
      {...props}
    >
      {children}
    </MuiStack>
  )
}
