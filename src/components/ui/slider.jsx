import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '../../lib/utils'

export const Slider = React.forwardRef(
  (
    {
      className,
      thumbClassName,
      thumbClassNames,
      orientation,
      rangeClassName,
      ...props
    },
    ref,
  ) => {
    const values = props.value ?? props.defaultValue ?? []
    const thumbCount = Array.isArray(values) ? Math.max(values.length, 1) : 1

    const baseThumbClass =
      'block h-7 w-7 sm:h-5 sm:w-5 rounded-full border border-border bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'

    const perThumbClasses = Array.isArray(thumbClassNames)
      ? thumbClassNames
      : null

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          orientation === 'vertical' && 'h-32 w-5 flex-col',
          className,
        )}
        orientation={orientation}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            'relative grow overflow-hidden rounded-full bg-muted',
            orientation === 'vertical' ? 'h-full w-2' : 'h-2 w-full',
          )}
        >
          <SliderPrimitive.Range
            className={cn(
              'absolute bg-primary',
              orientation === 'vertical' ? 'w-full' : 'h-full',
              rangeClassName && orientation !== 'vertical' && rangeClassName,
            )}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }).map((_, i) => (
          <SliderPrimitive.Thumb
            // Radix wants a stable key per thumb index
            key={i}
            className={cn(
              baseThumbClass,
              perThumbClasses ? perThumbClasses[i] : thumbClassName,
            )}
          />
        ))}
      </SliderPrimitive.Root>
    )
  },
)
Slider.displayName = SliderPrimitive.Root.displayName
