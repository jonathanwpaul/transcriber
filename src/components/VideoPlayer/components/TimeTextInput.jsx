import { ChevronDown, ChevronUp } from 'lucide-react'

import { Button } from '@components/ui/button'
import { ScrubbableNumberInput } from './ScrubbableNumberInput'

export const TimeTextInput = props => {
  const {
    onChange,
    value,
    changeAmount = 0.1,
    min = 0,
    max,
    label,
    disabled,
  } = props

  const handleChange = newValue => {
    if (Number.isNaN(newValue)) return
    if (typeof min === 'number' && newValue < min) return
    if (typeof max === 'number' && newValue > max) return
    onChange(newValue)
  }

  return (
    <div className='flex w-full items-center gap-2'>
      {label && (
        <div className='w-24 text-xs font-medium text-muted-foreground'>
          {label}
        </div>
      )}
      <div className='flex-1'>
        <ScrubbableNumberInput
          value={value}
          disabled={disabled}
          onChange={handleChange}
          step={changeAmount}
          min={min}
          max={max}
        />
      </div>
    </div>
  )
}
