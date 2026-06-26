import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-ui font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-gold text-canvas hover:bg-gold/90': variant === 'primary',
          'bg-transparent text-ink-muted hover:bg-canvas-muted hover:text-ink border border-border': variant === 'ghost',
          'bg-coral/20 text-coral hover:bg-coral/30 border border-coral/30': variant === 'danger',
        },
        {
          'text-xs px-3 py-1.5 gap-1.5': size === 'sm',
          'text-sm px-4 py-2 gap-2': size === 'md',
          'text-base px-6 py-3 gap-2': size === 'lg',
        },
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
}
