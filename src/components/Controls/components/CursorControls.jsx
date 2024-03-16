import { ToggleButton, ToggleButtonGroup } from '@mui/material'

const CursorControls = ({ textFieldRef, setCursorPosition }) => {
  if (!textFieldRef?.current) return

  const handleMoveCursor = () => {
    const textInput = textFieldRef.current
    textInput.focus()
    textInput.setSelectionRange(0, 0)
  }
  return (
    <ToggleButtonGroup exclusive color='primary'>
      <ToggleButton onClick={handleMoveCursor}>{'<'}</ToggleButton>
      {/* <ToggleButton>Test</ToggleButton> */}
    </ToggleButtonGroup>
  )
}
export default CursorControls
