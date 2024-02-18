import { Card, TextField } from '@mui/material'
import { Controls, MusicRender } from './'
import abcjs from 'abcjs'
import { useState } from 'react'

const SCALE = 2
const AVAILABLE_NOTES = [
  'e,,',
  'f,,',
  'g,,',
  'a,,',
  'b,,',
  'c,',
  'd,',
  'e,',
  'f,',
  'g,',
  'a,',
  'b,',
  'c',
  'd',
  'e',
  'f',
  'g',
  'a',
  'b',
  "c'",
  "d'",
  "e'",
  "f'",
  "g'",
  "a'",
  "b'",
  "c''",
]

export const Editor = () => {
  const [durationValue, setDuration] = useState('1')
  console.log(AVAILABLE_NOTES.join(''))
  const [abcString, setAbcString] = useState('')
  const handleClickEditor = e => {
    console.log('clicked', e.clientY)
    const staff = document.querySelector('.abcjs-top-line')?.parentElement
    if (!staff) return // the abcstring is invalid (or empty)

    // figure out line spacing
    const [firstLineY, secondLineY] = Array.from(staff.childNodes)
      .slice(2)
      .map(line => line.attributes.d.value.split(' ')[5])
    const lineSpacing = (secondLineY - firstLineY) * SCALE

    // create array of potential input note points
    const staffOffsetY = staff.getBoundingClientRect().top
    // let staffLines = []
    // for (let i = 0; i < 10; i++) {
    //   staffLines.push(staffOffsetY + (i * lineSpacing) / 2)
    // }

    const differenceY = e.clientY - staffOffsetY
    const clickedIndexOffset = Math.round(differenceY / (lineSpacing / 2))
    const clickedIndex = AVAILABLE_NOTES.indexOf('f') - clickedIndexOffset
    const clickedNote = AVAILABLE_NOTES[clickedIndex]
    clickedNote &&
      setAbcString(abcString => abcString + clickedNote + durationValue)
  }
  const handleClick = (
    abcelem,
    tuneNumber,
    classes,
    analysis,
    drag,
    mouseEvent
  ) => {
    mouseEvent.preventDefault()
    console.log({ abcelem, tuneNumber, classes, analysis, drag, mouseEvent })
  }

  abcjs.renderAbc('music-render', abcString + '|x', {
    clickListener: handleClick,
    scale: SCALE,
    wrap: {
      preferredMeasuresPerLine: 4,
      minSpacing: 1.8,
      maxSpacing: 2.7,
    },
  })
  const handleStringChange = e => {
    setAbcString(e.target.value)
  }

  return (
    <div className='editor vertical-container' id='editor'>
      <Card
        elevation={5}
        onClick={handleClickEditor}
        className='music-render'
        style={{ overflow: 'auto', flex: 1 }}
      >
        <MusicRender id='music-render' />
      </Card>
      <Card elevation={5} className='editor-inputs'>
        <TextField
          value={abcString}
          fullWidth
          multiline
          onChange={handleStringChange}
        />
        <Controls durationValue={durationValue} setDuration={setDuration} />
      </Card>
    </div>
  )
}
