import { Card, TextField } from '@mui/material'
import { Controls, MusicRender } from './'
import abcjs from 'abcjs'
// import allNotes from 'abcjs/src/parse/all-notes.js' //invasively importing non-indexed module export
import { useEffect, useState } from 'react'
import { allPitches, moveNote, tokenize } from '../utils'
import { Preferences } from '@capacitor/preferences'

const SCALE = 1

export const Editor = () => {
  const [durationValue, setDuration] = useState('1')
  const [noteInputMode, setNoteInputMode] = useState()
  const [inputMode, setInputMode] = useState('note')
  const [abcString, setAbcString] = useState('')
  const [staffData, setStaffData] = useState()
  const [saves, setSaves] = useState([])

  // console.log(allPitches.join(''))
  const oldhandleClickEditor = e => {
    console.log('clicked', { x: e.clientX, y: e.clientY })
    const staff = document.querySelector('.abcjs-top-line')?.parentElement
    if (!staff) return // the abcstring is invalid (or empty)

    // figure out line spacing
    const [firstLineY, secondLineY] = Array.from(staff.childNodes)
      .slice(2)
      .map(line => line.attributes.d.value.split(' ')[5])
    const lineSpacing = (secondLineY - firstLineY) * SCALE

    // create array of potential input note points
    const staffOffsetY = staff.getBoundingClientRect().top
    console.log(staffOffsetY)
    // let staffLines = []
    // for (let i = 0; i < 10; i++) {
    //   staffLines.push(staffOffsetY + (i * lineSpacing) / 2)
    // }

    const differenceY = e.clientY - staffOffsetY
    const clickedIndexOffset = Math.round(differenceY / (lineSpacing / 2))
    const clickedIndex = allPitches.indexOf('f') - clickedIndexOffset
    const clickedNote = allPitches[clickedIndex]
    console.log('clickedNote: ', clickedNote)
    var insertValue
    if (inputMode === 'rest') {
      insertValue = 'z' + durationValue
    } else if (clickedNote) {
      insertValue = clickedNote + durationValue
    } else {
      insertValue = ''
    }

    setAbcString(abcString => abcString + insertValue)
  }

  const handleClickEditor = e => {
    if (!staffData) return

    const staffParams = staffData.map(staff => ({
      staffTopLineY: staff[0].topLine,
      staffBottomLineY: staff[0].bottomLine,
      staffSpacingY: (staff[0].bottomLine - staff[0].topLine) / staff[0].lines,
    }))

    console.log('params: ', staffParams)
    const clicked = { x: e.clientX, y: e.clientY }
    console.log(clicked)
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
      console.log('clickListener')
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

  //TODO: specify key to save
  const handleSave = async () => {
    console.log(abcString)
    await Preferences.set({ key: 3, value: abcString })
    const { keys } = await Preferences.keys()
    console.log(keys)
    setSaves(keys)
  }

  const loadSave = async selectedValue => {
    console.log('loading save: ', selectedValue)
    const { value } = await Preferences.get({ key: selectedValue })
    console.log(value)
    setAbcString(value)
  }

  useEffect(() => {
    const visualObj = abcjs.renderAbc(
      'music-render',
      abcString + (noteInputMode ? 'x' : ''),
      {
        clickListener: handleClick,
        scale: SCALE,
        wrap: {
          preferredMeasuresPerLine: 4,
          minSpacing: 2,
          maxSpacing: 2.8,
        },
        staffwidth:
          document.querySelector('#music-render')?.getBoundingClientRect()
            .width - 30 || 100,
        // showDebug: ['box'],
        dragging: true,
        dragColor: 'blue',
        selectionColor: 'green',
        // viewportVertical: true,
        // viewportHorizontal: true,
      }
    )[0]
    setStaffData(visualObj.lines.map(line => line.staffGroup.staffs))
  }, [abcString, noteInputMode])

  console.log(staffData)

  return (
    <div className='editor vertical-container' id='editor'>
      <Card
        elevation={5}
        className='music-render'
        onMouseUp={handleClickEditor}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <MusicRender id='music-render' />
      </Card>
      <Card elevation={5} className='editor-inputs'>
        <TextField
          fullWidth
          multiline
          onChange={handleStringChange}
          value={abcString}
          maxRows={1.5}
        />
        <Controls
          inputMode={inputMode}
          setInputMode={setInputMode}
          durationValue={durationValue}
          setDuration={setDuration}
          handleSave={handleSave}
          loadSave={loadSave}
          saves={saves}
        />
      </Card>
    </div>
  )
}
