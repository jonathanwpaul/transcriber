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
    accentColor,
  } = props

  const handleChange = newValue => {
    if (Number.isNaN(newValue)) return
    if (typeof min === 'number' && newValue < min) return
    if (typeof max === 'number' && newValue > max) return
    onChange(newValue)
  }

  return (
    <div className='flex w-full items-center justify-between gap-2 sm:px-8'>
      {label && (
        <div className='w-24 flex-1 text-xs font-medium text-foreground'>
          {label}
        </div>
      )}
      <div className='flex items-center'>
        <ScrubbableNumberInput
          value={value}
          disabled={disabled}
          onChange={handleChange}
          step={changeAmount}
          min={min}
          max={max}
          accentColor={accentColor}
        />
      </div>
    </div>
  )
}
