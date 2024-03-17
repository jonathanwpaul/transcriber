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

  const whiteKeyWidthPercent = 100 / notes.length
  const blackKeyWidthPercent = whiteKeyWidthPercent / 2

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
          <WhiteKey width={whiteKeyWidthPercent} {...props} />
        ) : (
          <BlackKey width={blackKeyWidthPercent} {...props} />
        )
      })}
    </ToggleButtonGroup>
  )
}

const WhiteKey = ({ note, width, ...otherProps }) => (
  <ToggleButton
    {...otherProps}
    style={{
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: 5,
      border: '1px solid black',
      // float: 'left',
      // position: 'relative',
      width: `${width}vw`,
      backgroundColor: note === 'c' && '#e3eefa',
    }}
  ></ToggleButton>
)

const BlackKey = ({ note, width, ...otherProps }) => (
  <ToggleButton
    {...otherProps}
    style={{
      // '&:hover': 'blue', //'#1f1f1f',
      backgroundColor: 'black',
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: 5,
      color: 'white',
      // float: 'left',
      height: '55%',
      marginLeft: `${-width / 2}vw`,
      marginRight: `${-width / 2}vw`,
      // position: 'relative',
      width: `${width}vw`,
      zIndex: 1,
    }}
  ></ToggleButton>
)

export default NoteControls
