import { Card } from '@mui/material'
import abcjs from 'abcjs'
import React, { useEffect, useRef, useCallback, forwardRef } from 'react'
import { moveNote, tokenize } from '../utils'

const MusicRender = ({ scaleFactor, setDuration, abcString, setAbcString }) => {
  const wrapperRef = useRef()

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
      setDuration(abcelem.abselem.duration)
    },
    [abcString, setAbcString, setDuration]
  )

  useEffect(() => {
    console.log('calling abcjs render effect')
    abcjs.renderAbc('music-render', abcString, {
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
      dragging: true,
      selectionColor: 'blue',
      dragColor: 'purple',
      // viewportVertical: true,
      // viewportHorizontal: true,
    })
  }, [abcString, scaleFactor, handleClick])

  return (
    <Card elevation={5} className='music-render'>
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

export default MusicRender
