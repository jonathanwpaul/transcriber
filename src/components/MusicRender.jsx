import { Card } from '@mui/material'
import abcjs from 'abcjs'
// import allNotes from 'abcjs/src/parse/all-notes.js' //invasively importing non-indexed module export
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  forwardRef,
} from 'react'
import { allPitches, getDurationText, moveNote, tokenize } from '../utils'

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
  console.log('***music render')

  const [visualObj, setVisualObj] = useState()
  const wrapperRef = useRef()
  // const handleClickOutside = event => {
  //   console.log(wrapperRef.current)
  //   if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
  //     console.log('not in div')
  //     setSelectedAbcElem(undefined)
  //     const prevSelectedNote = document.querySelector('.abcjs-note_selected')
  //     prevSelectedNote?.classList.remove('abcjs-note_selected')
  //     prevSelectedNote?.setAttribute('fill', 'currentColor')
  //   }
  // }

  // useEffect(() => {
  //   document.addEventListener('click', handleClickOutside)
  //   return () => {
  //     document.removeEventListener('click', handleClickOutside)
  //   }
  // }, [])

  //assumes treble cleff only and one staff only
  const handleClickEditor = useCallback(
    e => {
      const staffData = visualObj?.lines.map(line => line.staffGroup.staffs)

      if (!staffData || staffData.length === 0) return

      const voices = visualObj.makeVoicesArray()
      const staffTopNoteIndex = allPitches.indexOf('f') //TODO: make this work for other clefs

      const bounding = document
        .querySelector('#music-render')
        .getBoundingClientRect()
      const staffParams = staffData.map(staff => {
        return {
          staffTopLineY: staff[0].topLine,
          staffBottomLineY: staff[0].bottomLine,
          staffSpacingY:
            (staff[0].bottomLine - staff[0].topLine) / (staff[0].lines - 1),
        }
      })

      const clicked = {
        x: e.clientX - bounding.left,
        y: e.clientY - bounding.top,
      }

      // figure out which staff was clicked on (y)
      //FIX: won't register a different staff until you have clicked below the "f" line
      const potentialStaffs = staffParams.filter(
        staff => staff.staffTopLineY <= clicked.y
      )

      const staffIndex =
        potentialStaffs.length > 0 ? potentialStaffs.length - 1 : 0

      //TODO: figure out when voices array will have multiple elements
      // console.table(voices[0].map(voice => [voice.elem.x, voice.elem.w]))
      const clickedVoice = voices[0].filter(
        voice =>
          voice.line === staffIndex && voice.elem.x + voice.elem.w >= clicked.x
      )[0]

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
    },
    [duration, inputMode, setAbcString, visualObj]
  )

  const handleClick = useCallback(
    (abcelem, tuneNumber, classes, analysis, drag, mouseEvent) => {
      if (!mouseEvent.isTrusted) {
        mouseEvent.stopPropagation()
      }
      const originalText = abcString.substring(
        abcelem.startChar,
        abcelem.endChar
      )
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

        console.log('setting abcstring')
        setAbcString(
          abcString.substring(0, abcelem.startChar) +
            newText +
            abcString.substring(abcelem.endChar)
        )
      }
      console.log('handling click for: ', abcelem)

      // if (
      //   abcelem.abselem.elemset[0].getAttribute('data-index') !==
      //   selectedAbcElem?.abselem.elemset[0].getAttribute('data-index')
      // ) {
      //   console.log(abcelem?.abselem.elemset[0].getAttribute('data-index'))
      //   console.log(
      //     selectedAbcElem?.abselem.elemset[0].getAttribute('data-index')
      //   )
      setSelectedAbcElem(abcelem)
      // }
      setInputMode(abcelem.rest ? 'rest' : 'note')
      setDuration(abcelem.abselem.duration)
    },
    [abcString, setAbcString, setDuration, setInputMode, setSelectedAbcElem]
  )

  //TODO: fix bug where note will disappear while dragging, causing the element to be removed
  useEffect(() => {
    console.log('calling abcjs render effect')
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
  }, [abcString])

  useEffect(() => {
    console.log('calling reselect effect')
    const dataIndex =
      selectedAbcElem?.abselem.elemset[0].getAttribute('data-index')
    const node = document.querySelector(
      `#music-render [data-index="${dataIndex}"]`
    )
    if (!node) return
    // setSelectedAbcElem()
    console.log(
      'reselecting previously selected element: ',
      node.getAttribute('data-index')
    )
    node.dispatchEvent(new Event('mousedown', { bubbles: true }))
    node.dispatchEvent(new Event('mouseup', { bubbles: true }))
  }, [abcString])

  return (
    <Card elevation={5} className='music-render' onMouseUp={handleClickEditor}>
      <MusicRenderDiv
        id='music-render'
        ref={wrapperRef}
        style={{ margin: 'auto', minWidth: '100%' }}
      />
    </Card>
  )
}

const MusicRenderDiv = forwardRef((props, ref) => (
  <div {...props} ref={ref}></div>
))
