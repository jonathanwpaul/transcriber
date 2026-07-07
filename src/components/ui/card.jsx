import * as React from 'react'

import { cn } from '../../lib/utils'

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-md',
      className,
    )}
    {...props}
  >
    {props.children}
  </div>
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-4', className)}
    {...props}
  >
    {props.children}
  </div>
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-base font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  >
    {props.children}
  </h3>
))
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4', className)} {...props}>
    {props.children}
  </div>
))
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
