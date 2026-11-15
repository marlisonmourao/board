import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export interface ButtonProps extends ComponentProps<"button"> {}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={twMerge(
        "text-navy-100 flex items-center gap-2 rounded-md px-3 py-2 bg-navy-700 cursor-pointer",
        "hover:bg-navy-600 transition-colors duration-150",
        "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950",
        className,
      )}
      {...props}
    />
  )
}
