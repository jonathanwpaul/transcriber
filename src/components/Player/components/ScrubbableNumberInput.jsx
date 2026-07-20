import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '../../../lib/utils'

const accentClasses = {
  emerald: { border: 'border-emerald-500', text: 'text-emerald-500' },
  red: { border: 'border-red-500', text: 'text-red-500' },
}

const toComponents = totalSeconds => {
  const s = Math.round(Math.max(0, totalSeconds) * 10) / 10
  return {
    hours: Math.floor(s / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: Math.floor(s % 60),
    tenths: Math.round((s % 1) * 10),
  }
}

const formatTimecode = seconds => {
  const { hours, mins, secs, tenths } = toComponents(seconds)
  return (
    `${String(hours).padStart(2, '0')}:` +
    `${String(mins).padStart(2, '0')}:` +
    `${String(secs).padStart(2, '0')}.` +
    `${tenths}`
  )
}

export const ScrubbableNumberInput = ({
  value,
  onChange,
  step = 1,
  min,
  max,
  disabled,
  className,
  accentColor,
}) => {
  const [dragState, setDragState] = useState(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null) // string values for each segment while editing
  const hasDraggedRef = useRef(false)
  const containerRef = useRef(null)
  const hoursRef = useRef(null)
  const minsRef = useRef(null)
  const secsRef = useRef(null)
  const tenthsRef = useRef(null)

  const accent = disabled
    ? { border: 'border-muted-foreground/30', text: 'text-muted-foreground/50' }
    : (accentClasses[accentColor] ?? {
        border: 'border-border',
        text: 'text-foreground',
      })

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
    const current = parseValue()
    const next = clamp(current + deltaSteps * step)
    if (next !== current) onChange(next)
  }

  const handleWheel = e => {
    e.preventDefault()
    applyDelta(e.deltaY < 0 ? 1 : -1)
  }

  const handlePointerDown = e => {
    if (editing) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    hasDraggedRef.current = false

    setDragState({
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startValue: parseValue(),
    })

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch (_) {}
  }

  const handlePointerMove = e => {
    if (!dragState || e.pointerId !== dragState.pointerId) return
    e.preventDefault()

    const deltaX = e.clientX - dragState.startX
    const deltaY = e.clientY - dragState.startY

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)
      hasDraggedRef.current = true

    const steps = deltaX / 10 + -deltaY / 30
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

  const initDraft = () => {
    const { hours, mins, secs, tenths } = toComponents(parseValue())
    return {
      hours: String(hours).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
      tenths: String(tenths),
    }
  }

  const exitEditing = () => {
    setEditing(false)
    setDraft(null)
  }

  const handleDisplayClick = () => {
    if (!hasDraggedRef.current) {
      setDraft(initDraft())
      setEditing(true)
    }
  }

  useEffect(() => {
    if (editing) {
      hoursRef.current?.focus()
      hoursRef.current?.select()
    }
  }, [editing])

  const handleContainerBlur = e => {
    if (!containerRef.current?.contains(e.relatedTarget)) exitEditing()
  }

  useEffect(() => {
    if (!dragState) return
    const prevent = e => e.preventDefault()
    document.addEventListener('wheel', prevent, { passive: false })
    return () => document.removeEventListener('wheel', prevent)
  }, [dragState])

  const makeSegmentChange = (field, maxLen, maxVal, nextRef) => e => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, maxLen)
    const newDraft = { ...draft, [field]: raw }
    setDraft(newDraft)

    // Only call onChange when the field has a value (allow blank while typing)
    if (raw !== '') {
      const fallback = toComponents(parseValue())
      const seg = (key, cap) =>
        newDraft[key] !== ''
          ? Math.min(cap, parseInt(newDraft[key], 10) || 0)
          : fallback[key]
      const total =
        seg('hours', 99) * 3600 +
        seg('mins', 59) * 60 +
        seg('secs', 59) +
        seg('tenths', 9) * 0.1
      onChange(clamp(Math.round(total * 10) / 10))
    }

    if (raw.length >= maxLen && nextRef?.current) {
      nextRef.current.focus()
      nextRef.current.select()
    }
  }

  const handleSegmentKeyDown = e => {
    if (e.key === 'Escape') exitEditing()
  }

  const segments =
    draft ??
    (() => {
      const { hours, mins, secs, tenths } = toComponents(parseValue())
      return {
        hours: String(hours).padStart(2, '0'),
        mins: String(mins).padStart(2, '0'),
        secs: String(secs).padStart(2, '0'),
        tenths: String(tenths),
      }
    })()

  const segClass = cn(
    'bg-transparent outline-none text-center font-mono text-sm',
    accent.text,
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        'inline-flex items-center justify-between rounded-full border select-none',
        accent.border,
        className,
      )}
      onBlur={handleContainerBlur}
    >
      <button
        type='button'
        className={cn('px-2 py-2 shrink-0', accent.text)}
        onClick={() => applyDelta(-1)}
        tabIndex={-1}
      >
        <ChevronLeft size={14} />
      </button>

      {editing ? (
        <div
          className={cn(
            'flex items-center px-1 py-2 font-mono text-md',
            accent.text,
          )}
        >
          <input
            ref={hoursRef}
            type='text'
            inputMode='numeric'
            maxLength={2}
            value={segments.hours}
            onChange={makeSegmentChange('hours', 2, 99, minsRef)}
            onKeyDown={handleSegmentKeyDown}
            onFocus={e => e.target.select()}
            className={segClass}
            style={{ width: '2ch' }}
          />
          <span className='select-none text-muted-foreground'>:</span>
          <input
            ref={minsRef}
            type='text'
            inputMode='numeric'
            maxLength={2}
            value={segments.mins}
            onChange={makeSegmentChange('mins', 2, 59, secsRef)}
            onKeyDown={handleSegmentKeyDown}
            onFocus={e => e.target.select()}
            className={segClass}
            style={{ width: '2ch' }}
          />
          <span className='select-none text-muted-foreground'>:</span>
          <input
            ref={secsRef}
            type='text'
            inputMode='numeric'
            maxLength={2}
            value={segments.secs}
            onChange={makeSegmentChange('secs', 2, 59, tenthsRef)}
            onKeyDown={handleSegmentKeyDown}
            onFocus={e => e.target.select()}
            className={segClass}
            style={{ width: '2ch' }}
          />
          <span className='select-none'>.</span>
          <input
            ref={tenthsRef}
            type='text'
            inputMode='numeric'
            maxLength={1}
            value={segments.tenths}
            onChange={makeSegmentChange('tenths', 1, 9, null)}
            onKeyDown={handleSegmentKeyDown}
            onFocus={e => e.target.select()}
            className={segClass}
            style={{ width: '1ch' }}
          />
        </div>
      ) : (
        <span
          className={cn(
            'text-md font-mono px-2 py-2 cursor-pointer whitespace-nowrap',
            accent.text,
            dragState && 'cursor-grabbing',
          )}
          style={{ touchAction: 'none' }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={handleDisplayClick}
        >
          {formatTimecode(parseValue())}
        </span>
      )}

      <button
        type='button'
        className={cn('px-1.5 py-1.5 shrink-0', accent.text)}
        onClick={() => applyDelta(1)}
        tabIndex={-1}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
