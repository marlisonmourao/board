'use client'

import { MoveLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()

  function handleBack() {
    router.back()
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="flex w-fit items-center gap-2 cursor-pointer rounded-sm text-navy-200 outline-none transition-colors hover:text-navy-100 focus-visible:ring-2 focus-visible:ring-accent"
    >
      <MoveLeftIcon className="size-4" />
      <span className="text-xs">Voltar ao quadro</span>
    </button>
  )
}
