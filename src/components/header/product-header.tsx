import { UserButton } from './user-button'
import Link from 'next/link'

interface ProductHeaderProps {
  children?: React.ReactNode
  isBoard?: boolean
}

export function ProductHeader({ children, isBoard = false }: ProductHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-[1560px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {isBoard ? (
          <h1 className="text-2xl font-semibold tracking-tight text-navy-50 sm:text-[28px]">
            Roteiro do produto
          </h1>
        ) : (
          <Link
            href="/"
            className="inline-block text-2xl font-semibold tracking-tight text-navy-50 outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent sm:text-[28px]"
          >
            Roteiro do produto
          </Link>
        )}
        <p className="max-w-xl text-sm leading-6 text-navy-300">
          Acompanhe o que está em andamento e o que vem a seguir.
        </p>
      </div>

      <div className="flex w-full items-center gap-3 sm:w-auto">
        {children}
        <UserButton />
      </div>
    </header>
  )
}
