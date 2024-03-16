import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { allPitches, getDurationText } from '../../../utils'

const NoteControls = ({ onChange, duration }) => {
  const notes = allPitches
    .slice(allPitches.indexOf('B,'), allPitches.indexOf("b'"))
    .map(pitch => ({ note: pitch, white: true }))

  const flats = notes.map(noteObj => ({
    note: '_' + noteObj.note,
    white: false,
  }))

  const keyboard = []
  for (let i = 0; i < notes.length; i++) {
    if (!['c', 'f'].includes(notes[i].note[0].toLowerCase()))
      keyboard.push(flats[i])
    keyboard.push(notes[i])
  }

  console.log(keyboard)

  return (
    <ToggleButtonGroup
      style={{ width: '100%', height: '100%' }}
      exclusive
      color='primary'
      onChange={onChange}
    >
      {keyboard.map(({ note, white }) => {
        const props = {
          note,
          key: note,
          value: note + getDurationText(duration),
        }
        return white ? (
          <WhiteKey {...props} />
        ) : (
          <BlackKey margin={-0.22 * 100} {...props} />
        )
      })}
    </ToggleButtonGroup>
  )
}

const WhiteKey = ({ note, ...otherProps }) => (
  <ToggleButton
    style={{
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: 5,
      border: '1px solid black',
      flex: 2,
    }}
    {...otherProps}
  ></ToggleButton>
)

const BlackKey = ({ note, margin, ...otherProps }) => (
  <ToggleButton
    style={{
      '&:hover': 'blue', //'#1f1f1f',
      backgroundColor: 'black',
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: 5,
      color: 'white',
      flex: 1,
      height: '55%',
      // position: 'absolute',
      // marginLeft: margin,
      // marginRight: margin,
      zIndex: 1,
    }}
    {...otherProps}
  ></ToggleButton>
)

export default NoteControls
