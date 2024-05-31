import { SpaceBar } from '@mui/icons-material'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'

const CursorControls = ({
  abcString,
  cursorPosition,
  handleSpaceInput,
  setCursorPosition,
}) => {
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
      <ToggleButton disabled onClick={handleMoveCursorLeft}>
        {'<'}
      </ToggleButton>
      <ToggleButton value=' ' onClick={handleSpaceInput}>
        <SpaceBar />
      </ToggleButton>
      <ToggleButton disabled onClick={handleMoveCursorRight}>
        {'>'}
      </ToggleButton>
      {/* <ToggleButton>Test</ToggleButton> */}
    </ToggleButtonGroup>
  )
}
export default CursorControls
