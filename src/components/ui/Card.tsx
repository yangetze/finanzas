import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export function Card({ className, children, padding = 'md', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-canvas-soft border border-border rounded-xl',
        {
          'p-3': padding === 'sm',
          'p-4 md:p-5': padding === 'md',
          'p-6 md:p-8': padding === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
