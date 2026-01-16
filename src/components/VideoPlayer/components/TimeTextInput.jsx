import { ChevronDown, ChevronUp } from 'lucide-react'

import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'

const TimeTextInput = props => {
  const { onChange, value, changeAmount, min = 0, max, label, disabled } = props

  const handleChange = amt => {
    const numericValue = typeof value === 'number' ? value : Number(value)
    const newValue = numericValue + amt
    if ((amt < 0 && newValue >= min) || (amt > 0 && newValue <= max)) {
      onChange(newValue)
    }
  }

  return (
    <div className='flex w-full min-w-[10rem] max-w-[14rem] flex-col gap-1'>
      {label && (
        <div className='text-xs font-medium text-muted-foreground'>{label}</div>
      )}
      <div className='flex items-center gap-2'>
        <Input
          value={value}
          disabled={disabled}
          onChange={e => onChange(Number(e.target.value))}
          type='number'
          step={0.1}
        />
        <div className='flex flex-col gap-1'>
          <Button
            type='button'
            size='icon'
            variant='outline'
            disabled={disabled}
            onClick={() => handleChange(changeAmount)}
            className='h-9 w-9'
            aria-label='Increase'
          >
            <ChevronUp />
          </Button>
          <Button
            type='button'
            size='icon'
            variant='outline'
            disabled={disabled}
            onClick={() => handleChange(-1 * changeAmount)}
            className='h-9 w-9'
            aria-label='Decrease'
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TimeTextInput
