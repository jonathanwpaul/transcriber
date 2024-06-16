import { Card } from '@mui/material'
import abcjs from 'abcjs'
import React, {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useState,
} from 'react'
import { ScaleFactorControls } from './components'
import { moveNote, tokenize } from '../../../utils'

const MusicRender = ({
  abcString,
  scaleFactor,
  selectedAbcElem,
  setAbcString,
  setScaleFactor,
  setSelectedAbcElem,
  setDuration,
}) => {
  const wrapperRef = useRef()
  const visualObjRef = useRef()

  const voiceArr =
    visualObjRef.current && visualObjRef.current[0].lines[0].staff[0].voices

  /**
   * mouseUp handler, if this handler is reached, we want to clear out the selected element
   */
  const handleMouseUp = useCallback(
    e => {
      setSelectedAbcElem()
      if (visualObjRef.current) {
        visualObjRef.current[0].engraver.clearSelection()
      }
    },
    [abcString]
  )

  /**
   * main click handler for the music renderer. This seems to get executed on mouseup
   */
  const handleClick = useCallback(
    (abcelem, tuneNumber, classes, analysis, drag, mouseEvent) => {
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

        setAbcString(
          abcString.substring(0, abcelem.startChar) +
            newText +
            abcString.substring(abcelem.endChar)
        )
      }

      if (
        abcelem
        // && (!selectedDataIndex ||
        //   selectedDataIndex !==
        //     abcelem.abselem.elemset[0].getAttribute('data-index'))
      ) {
        mouseEvent.stopPropagation() //this ensures the event does not reach the custom handleMouseUp
        setSelectedAbcElem(abcelem)
        setDuration(abcelem.duration)
      }
    },
    [abcString]
  )

  // re-render the music
  useEffect(() => {
    visualObjRef.current = abcjs.renderAbc('music-render', abcString, {
      clickListener: handleClick,
      scale: scaleFactor,
      wrap: {
        preferredMeasuresPerLine: 8,
        minSpacing: 2,
        maxSpacing: 2.5,
      },
      staffwidth:
        document.querySelector('#music-render')?.getBoundingClientRect().width -
          30 || 100,
      // showDebug: ['box'],
      // dragging: true,
      selectionColor: 'blue',
      dragColor: 'purple',
      // viewportVertical: true,
      // viewportHorizontal: true,
    })
  }, [abcString, scaleFactor, handleClick])

  // re-select a previously selected element
  // relies on patch to abcjs package
  useEffect(() => {
    if (!selectedAbcElem) return

    console.log(selectedAbcElem)
    const selectedDataIndex =
      selectedAbcElem.abselem.elemset[0].getAttribute('data-index')
    const node = document.querySelector(
      `#music-render [data-index="${selectedDataIndex}"]`
    )
    if (!node) return
    // setSelectedAbcElem()
    // console.log(
    //   'reselecting previously selected element: ',
    //   node.getAttribute('data-index')
    // )
    node.dispatchEvent(new Event('mousedown', { bubbles: true }))
    node.dispatchEvent(new Event('mouseup', { bubbles: true }))
  })

  return (
    <Card className='music-render vertical-container'>
      <MusicRenderDiv
        id='music-render'
        onMouseUp={handleMouseUp}
        ref={wrapperRef}
        style={{ margin: 'auto', minWidth: '100%' }}
      />
      <div style={{ padding: 5 }}>
        <ScaleFactorControls setScaleFactor={setScaleFactor} />
      </div>
    </Card>
  )
}

const MusicRenderDiv = forwardRef((props, ref) => (
  <div {...props} ref={ref}></div>
))

export default MusicRender
