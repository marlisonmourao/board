import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export interface InputProps extends ComponentProps<"input"> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={twMerge(
        "bg-navy-900 border border-navy-500 h-10 flex items-center placeholder-navy-300 px-3 rounded-md text-sm text-navy-50",
        "outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950",
        className,
      )}
      {...props}
    />
  )
}
