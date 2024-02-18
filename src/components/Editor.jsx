import { Card, TextField } from '@mui/material'
import { Controls, MusicRender } from './'
import abcjs from 'abcjs'
import allNotes from 'abcjs/src/parse/all-notes.js' //invasively importing non-indexed module export
import { useState } from 'react'
import { allPitches, moveNote, sanitize, tokenize } from '../utils'
const SCALE = 1

export const Editor = () => {
  const [durationValue, setDuration] = useState('1')
  const [noteInputMode, setNoteInputMode] = useState()
  const [abcString, setAbcString] = useState('')

  // console.clear()
  console.log(allPitches.join(''))

  const handleClickEditor = e => {
    console.log('clicked', { x: e.clientX, y: e.clientY })
    const staff = document.querySelector('.abcjs-top-line')?.parentElement
    // if (!staff) return // the abcstring is invalid (or empty)

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
    const clickedIndex = allPitches.indexOf('f') - clickedIndexOffset
    const clickedNote = allPitches[clickedIndex]
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
    const originalText = abcString.substring(abcelem.startChar, abcelem.endChar)
    if (
      abcelem.pitches &&
      drag &&
      drag.step &&
      abcelem.startChar >= 0 &&
      abcelem.endChar >= 0
    ) {
      var arr = tokenize(originalText)
      // arr now contains elements that are either a chord, a decoration, a note name, or anything else. It can be put back to its original string with .join("").
      for (var i = 0; i < arr.length; i++) {
        arr[i] = moveNote(arr[i], drag.step)
      }
      var newText = arr.join('')

      setAbcString(
        abcString.substring(0, abcelem.startChar) +
          newText +
          abcString.substring(abcelem.endChar)
      )
    } else if (abcelem.startChar >= 0 && abcelem.endChar >= 0) {
    }
  }

  const handleMouseEnter = () => {
    setNoteInputMode(true)
  }

  const handleMouseLeave = () => {
    setNoteInputMode(false)
  }

  const handleStringChange = e => {
    setAbcString(e.target.value)
  }

  abcjs.renderAbc('music-render', abcString + (noteInputMode ? 'x' : ''), {
    clickListener: handleClick,
    scale: SCALE,
    // wrap: {
    //   preferredMeasuresPerLine: 4,
    //   minSpacing: 2,
    //   maxSpacing: 2,
    // },
    // staffwidth: 800,
    viewportHorizontal: true,
    // scrollHorizontal: true,
    // showDebug: ['box'],
    dragging: true,
    selectionColor: 'green',
    dragColor: 'blue',
  })

  return (
    <div className='editor vertical-container' id='editor'>
      <Card
        elevation={5}
        onClick={handleClickEditor}
        className='music-render'
        style={{ overflow: 'auto', flex: 1 }}
      >
        <MusicRender
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          id='music-render'
        />
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
