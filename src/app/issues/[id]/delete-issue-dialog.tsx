'use client'

import { deleteIssueAction } from '@/actions/issues'
import { Button } from '@/components/button'
import * as Dialog from '@radix-ui/react-dialog'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function DeleteIssueDialog({ id, issueNumber }: { id: string; issueNumber: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    setError('')
    startTransition(async () => {
      try {
        const result = await deleteIssueAction(id)
        if (!result.ok) {
          setError(result.message)
          return
        }
        setOpen(false)
        router.replace('/')
        router.refresh()
      } catch {
        setError('Não foi possível excluir a issue. Tente de novo.')
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!pending) { setOpen(next); setError('') } }}>
      <Dialog.Trigger asChild>
        <Button type="button" className="text-sm text-red-300 hover:bg-red-950"><Trash2 aria-hidden="true" className="size-4" />Excluir</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-navy-500 bg-navy-800 p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="text-lg font-semibold">Excluir issue ISS-{issueNumber}?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-navy-200">A issue e seus comentários e curtidas serão excluídos permanentemente.</Dialog.Description>
          {error && <p role="alert" className="mt-4 text-sm text-amber-300">{error}</p>}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Dialog.Close asChild><Button type="button" disabled={pending}>Cancelar</Button></Dialog.Close>
            <Button type="button" disabled={pending} onClick={handleDelete} className="bg-red-700 text-white hover:bg-red-600">{pending ? 'Excluindo…' : 'Excluir issue'}</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
