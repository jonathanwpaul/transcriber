import { Card, TextField } from '@mui/material'
import { Controls } from '.'
import abcjs from 'abcjs'
// import allNotes from 'abcjs/src/parse/all-notes.js' //invasively importing non-indexed module export
import { useEffect, useState, useRef } from 'react'
import { allPitches, getDurationText, moveNote, tokenize } from '../utils'
import { Preferences } from '@capacitor/preferences'

const SCALE = 1

export const MusicRender = ({
  selectedAbcElem,
  setSelectedAbcElem,
  duration,
  setDuration,
  inputMode,
  setInputMode,
  abcString,
  setAbcString,
}) => {
  const [visualObj, setVisualObj] = useState()
  const staffData = visualObj?.lines.map(line => line.staffGroup.staffs)
  const clef = visualObj?.lines.staff && visualObj.lines.staff[0].clef

  //assumes treble cleff only and one staff only
  const handleClickEditor = e => {
    if (!staffData || staffData.length === 0) return

    console.log(visualObj)
    const voices = visualObj.makeVoicesArray()
    const staffTopNoteIndex = allPitches.indexOf('f') //TODO: make this work for other clefs

    const bounding = document
      .querySelector('#music-render')
      .getBoundingClientRect()
    const staffParams = staffData.map(staff => {
      return {
        staffTopLineY: staff[0].topLine + bounding.top,
        staffBottomLineY: staff[0].bottomLine + bounding.top,
        staffSpacingY:
          (staff[0].bottomLine - staff[0].topLine) / (staff[0].lines - 1),
      }
    })

    console.table(staffParams)

    const clicked = { x: e.clientX, y: e.clientY }
    console.log(clicked)

    // figure out which staff was clicked on (y)
    //FIX: won't register a different staff until you have clicked below the "f" line
    const potentialStaffs = staffParams.filter(
      staff => staff.staffTopLineY <= clicked.y
    )

    const staffIndex =
      potentialStaffs.length > 0 ? potentialStaffs.length - 1 : 0

    console.log({ staffIndex })

    // figure out which voice element was clicked on (x)
    // console.table(
    //   voices[0].map(voice => ({
    //     x: voice.elem.x,
    //     measureNumber: voice.measureNumber,
    //     pitches: voice?.elem?.abcelem?.pitches?.reduce(
    //       (p, c) => p.name + c.name
    //     ),
    //   }))
    // )
    //TODO: figure out when voices array will have multiple elements
    const clickedVoice = voices[0].filter(
      voice =>
        voice.line === staffIndex && voice.elem.x + voice.elem.w >= clicked.x
    )[0]

    console.log(clickedVoice?.elem?.abcelem)

    if (clickedVoice) return

    // on that staff, figure out which note was clicked on
    const clickDifferenceY = clicked.y - staffParams[staffIndex].staffTopLineY
    const indexDifference = Math.round(
      clickDifferenceY / (staffParams[0].staffSpacingY / 2)
    )
    const clickedNote = allPitches[staffTopNoteIndex - indexDifference]

    //check if this would overflow the barlength, and add a bar line if needed
    const barLength = visualObj.getBarLength()
    // TODO: get current bar's length

    //append the clicked note to the abcstring
    var insertValue
    if (inputMode === 'rest') {
      insertValue = 'z' + getDurationText(duration)
    } else if (clickedNote) {
      insertValue = clickedNote + getDurationText(duration)
    } else {
      insertValue = ''
    }

    setAbcString(abcString => abcString + insertValue)
  }

  const handleClick = (
    abcelem,
    tuneNumber,
    classes,
    analysis,
    drag,
    mouseEvent
  ) => {
    // mouseEvent.stopPropagation()
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
    }
    setSelectedAbcElem(abcelem)
    abcelem.rest ? setInputMode('rest') : setInputMode('note')

    setDuration(abcelem.abselem.duration)
  }

  useEffect(() => {
    const returnObjs = abcjs.renderAbc('music-render', abcString, {
      clickListener: handleClick,
      scale: SCALE,
      wrap: {
        preferredMeasuresPerLine: 8,
        minSpacing: 2,
        maxSpacing: 2.5,
      },
      staffwidth:
        document.querySelector('#music-render')?.getBoundingClientRect().width -
          30 || 100,
      // showDebug: ['box'],
      dragging: true,
      selectionColor: 'blue',
      dragColor: 'purple',
      // viewportVertical: true,
      // viewportHorizontal: true,
    })
    setVisualObj(returnObjs && returnObjs[0])
    setSelectedAbcElem(undefined)
  }, [abcString])

  return (
    <Card elevation={5} className='music-render' onMouseUp={handleClickEditor}>
      <MusicRenderDiv
        id='music-render'
        style={{ margin: 'auto', minWidth: '100%' }}
      />
    </Card>
  )
}

const MusicRenderDiv = props => <div {...props}></div>
