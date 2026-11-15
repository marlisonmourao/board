'use client'

import { changeCommentAction } from '@/actions/comments'
import { Button } from '@/components/button'
import * as Dialog from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function CommentActions({ issueId, commentId, text }: { issueId: string; commentId: string; text: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function change(nextText?: string) {
    setError('')
    startTransition(async () => {
      try {
        const result = await changeCommentAction({ issueId, commentId, ...(nextText === undefined ? {} : { text: nextText }) })
        if (!result.ok) { setError(result.message ?? 'Não foi possível alterar o comentário.'); return }
        setEditing(false)
        setOpen(false)
        router.refresh()
      } catch { setError('Não foi possível alterar o comentário. Tente novamente.') }
    })
  }

  return <div className="mt-2 space-y-2">
    {editing && <textarea aria-label="Editar comentário" value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} className="w-full rounded-md border border-navy-500 bg-navy-900 p-2 text-sm text-navy-50 focus-visible:ring-2 focus-visible:ring-accent" />}
    {error && <p role="alert" className="text-xs text-amber-300">{error}</p>}
    <div className="flex gap-2">
      {editing ? <><Button type="button" disabled={pending || !draft.trim()} onClick={() => change(draft)} className="text-xs">Salvar</Button><Button type="button" disabled={pending} onClick={() => { setEditing(false); setDraft(text); setError('') }} className="text-xs">Cancelar</Button></> : <Button type="button" onClick={() => { setDraft(text); setEditing(true) }} className="text-xs">Editar</Button>}
      <Dialog.Root open={open} onOpenChange={(next) => { if (!pending) { setOpen(next); setError('') } }}>
        <Dialog.Trigger asChild><Button type="button" className="text-xs text-red-300">Excluir</Button></Dialog.Trigger>
        <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[70] bg-black/70" /><Dialog.Content className="fixed left-1/2 top-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-navy-500 bg-navy-800 p-6">
          <Dialog.Title className="font-semibold">Excluir comentário?</Dialog.Title><Dialog.Description className="mt-2 text-sm text-navy-200">Esta ação é permanente.</Dialog.Description>
          {error && <p role="alert" className="mt-3 text-sm text-amber-300">{error}</p>}
          <div className="mt-5 flex justify-end gap-2"><Dialog.Close asChild><Button type="button" disabled={pending}>Cancelar</Button></Dialog.Close><Button type="button" disabled={pending} onClick={() => change()} className="bg-red-700 text-white">{pending ? 'Excluindo…' : 'Excluir comentário'}</Button></div>
        </Dialog.Content></Dialog.Portal>
      </Dialog.Root>
    </div>
  </div>
}
