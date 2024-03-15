import { ToggleButton, ToggleButtonGroup } from '@mui/material'

const AccidentalControls = ({ onChange }) => {
  const accidentals = [
    { label: '#', value: '^' },
    { label: 'n', value: '=' },
    { label: 'b', value: '_' },
  ]

  return (
    <ToggleButtonGroup exclusive color='primary' onChange={onChange}>
      {accidentals.map(e => (
        <ToggleButton key={e.label} value={e.value}>
          {e.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export default AccidentalControls
