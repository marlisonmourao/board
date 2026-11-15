import Link from 'next/link'
import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface CardRootProps extends ComponentProps<'article'> {}

function CardRoot({ className, ...props }: CardRootProps) {
  return (
    <article
      className={twMerge(
        'group rounded-lg border border-navy-600 bg-navy-800 p-3.5 transition-colors',
        'hover:border-navy-500 hover:bg-navy-700/70',
        className,
      )}
      {...props}
    />
  )
}

interface CardLinkProps extends ComponentProps<typeof Link> {}

function CardLink({ className, ...props }: CardLinkProps) {
  return (
    <Link
      className={twMerge(
        'block space-y-2 outline-none',
        'focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800',
        className,
      )}
      {...props}
    />
  )
}

interface CardHeaderProps extends ComponentProps<'div'> {}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={twMerge('flex flex-col gap-2', className)} {...props} />
}

interface CardTitleProps extends ComponentProps<'span'> {}

function CardTitle({ className, ...props }: CardTitleProps) {
  return <span className={twMerge('text-sm font-medium text-navy-50', className)} {...props} />
}

interface CardNumberProps extends ComponentProps<'span'> {}

function CardNumber({ className, ...props }: CardNumberProps) {
  return <span className={twMerge('text-xs text-navy-300', className)} {...props} />
}

interface CardFooterProps extends ComponentProps<'div'> {}

function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={twMerge('flex items-center gap-2', className)} {...props} />
}

export const Card = {
  Root: CardRoot,
  Link: CardLink,
  Header: CardHeader,
  Title: CardTitle,
  Footer: CardFooter,
  Number: CardNumber,
}
