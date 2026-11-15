import { ChevronDown } from 'lucide-react'
import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface SelectProps extends ComponentProps<'select'> {
  compact?: boolean
}

export function Select({ compact = false, className, children, ...props }: SelectProps) {
  return (
    <span className={compact ? 'relative inline-flex max-w-full' : 'relative block w-full'}>
      <select
        className={twMerge('appearance-none', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-navy-300"
      />
    </span>
  )
}
