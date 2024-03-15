import { ToggleButton, ToggleButtonGroup } from '@mui/material'

export const ScaleFactorControls = ({ setScaleFactor }) => {
  return (
    <ToggleButtonGroup exclusive color='primary'>
      <ToggleButton
        onClick={(_, newValue) => {
          console.log(newValue)
          setScaleFactor(scale =>
            scale + newValue > 0 ? scale + newValue : scale
          )
        }}
        key={'decrease'}
        value={-0.5}
      >
        -
      </ToggleButton>
      <ToggleButton
        onClick={() => {
          setScaleFactor(1)
        }}
        key={'decrease'}
        value={-0.5}
      >
        1
      </ToggleButton>
      <ToggleButton
        onClick={(_, newValue) => {
          setScaleFactor(scale => scale + newValue)
        }}
        key={'increase'}
        value={0.5}
      >
        +
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default ScaleFactorControls
