import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '../../lib/utils'

export const Slider = React.forwardRef(
  (
    { className, thumbClassNames, orientation, rangeClassName, ...props },
    ref,
  ) => {
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
            'relative grow overflow-hidden rounded-full bg-muted-foreground',
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
        {props.value?.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className={cn(thumbClassNames?.[i] ?? '')}
          />
        ))}
      </SliderPrimitive.Root>
    )
  },
)
Slider.displayName = SliderPrimitive.Root.displayName
