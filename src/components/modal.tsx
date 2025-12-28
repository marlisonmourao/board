'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

interface ModalProps extends Dialog.DialogContentProps {}

export function Modal({ className, ...props }: ModalProps) {
  const router = useRouter()

  function handleOpenChange(open: boolean) {
    if (!open) {
      router.back()
    }
  }

  return (
    <Dialog.Root defaultOpen onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className={twMerge(
            'fixed right-0 top-0 z-60 w-full h-full max-w-[540px] bg-navy-950 overflow-y-auto border border-navy-900',
            className,
          )}
          {...props}
        />
      </Dialog.Portal>
    </Dialog.Root>
  )
}
