import React, { useState, useRef } from 'react'

import { Input } from '@components/ui/input'

/**
 * Numeric input that supports:
 * - Scroll wheel to increment/decrement while hovered
 * - Pointer drag (mouse or touch) left/right to scrub the value
 */
export const ScrubbableNumberInput = ({
  value,
  onChange,
  step = 1,
  min,
  max,
  disabled,
  className,
  ...inputProps
}) => {
  const [dragState, setDragState] = useState(null)
  const containerRef = useRef(null)

  const clamp = newValue => {
    let v = newValue
    if (typeof min === 'number') v = Math.max(min, v)
    if (typeof max === 'number') v = Math.min(max, v)
    return v
  }

  const parseValue = () => {
    const n = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(n) ? n : 0
  }

  const applyDelta = deltaSteps => {
    if (disabled) return
    const current = parseValue()
    const next = clamp(current + deltaSteps * step)
    if (next !== current) onChange(next)
  }

  const handleWheel = e => {
    if (disabled) return
    // Only handle if the pointer is directly over this control.
    e.preventDefault()
    const direction = e.deltaY < 0 ? 1 : -1
    applyDelta(direction)
  }

  const handlePointerDown = e => {
    if (disabled) return
    // Only left button for mouse, allow any pointerType for touch/pen
    if (e.pointerType === 'mouse' && e.button !== 0) return

    const current = parseValue()
    setDragState({
      pointerId: e.pointerId,
      startX: e.clientX,
      startValue: current,
    })

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch (_) {}
  }

  const handlePointerMove = e => {
    if (!dragState || e.pointerId !== dragState.pointerId) return
    if (disabled) return

    // Prevent text selection / page scroll while scrubbing
    e.preventDefault()

    const deltaX = e.clientX - dragState.startX
    const pxPerStep = 10 // tune sensitivity: 10px -> 1 step
    if (Math.abs(deltaX) < 2) return

    const steps = Math.round(deltaX / pxPerStep)
    const next = clamp(dragState.startValue + steps * step)
    if (next !== parseValue()) onChange(next)
  }

  const endDrag = e => {
    if (!dragState || e.pointerId !== dragState.pointerId) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (_) {}
    setDragState(null)
  }

  return (
    <div
      ref={containerRef}
      className={className}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <Input
        type='number'
        disabled={disabled}
        value={value}
        onChange={e => {
          const n = Number(e.target.value)
          if (!Number.isFinite(n)) {
            onChange('')
          } else {
            onChange(clamp(n))
          }
        }}
        step={step}
        {...inputProps}
      />
    </div>
  )
}
