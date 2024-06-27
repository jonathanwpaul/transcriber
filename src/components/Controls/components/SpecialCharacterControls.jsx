import { ToggleButton, ToggleButtonGroup } from '@mui/material'

const SpecialCharacterControls = ({ onChange }) => {
  const barOptions = [
    '_',
    '^',
    '>',
    '<',
    '(',
    ')',
    '[',
    ']',
    '{',
    '}',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '.',
    '~',
  ]

  return (
    <ToggleButtonGroup exclusive color='primary' onChange={onChange}>
      {barOptions.map(e => (
        <ToggleButton key={e} value={e}>
          {e}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export default SpecialCharacterControls
