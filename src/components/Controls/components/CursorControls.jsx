import { ToggleButton, ToggleButtonGroup } from '@mui/material'

const CursorControls = ({ abcString, cursorPosition, setCursorPosition }) => {
  const handleMoveCursorLeft = () => {
    const newCursorPosition =
      cursorPosition > 0 ? cursorPosition - 1 : cursorPosition
    setCursorPosition(newCursorPosition)
  }

  const handleMoveCursorRight = () => {
    const newCursorPosition =
      cursorPosition < abcString.length ? cursorPosition + 1 : cursorPosition
    setCursorPosition(newCursorPosition)
  }

  return (
    <ToggleButtonGroup exclusive color='primary'>
      <ToggleButton onClick={handleMoveCursorLeft}>{'<'}</ToggleButton>
      <ToggleButton onClick={handleMoveCursorRight}>{'>'}</ToggleButton>

      {/* <ToggleButton>Test</ToggleButton> */}
    </ToggleButtonGroup>
  )
}
export default CursorControls
