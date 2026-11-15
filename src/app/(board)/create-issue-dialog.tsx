'use client'

import { createIssueAction } from '@/actions/issues'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { AssigneeSelect } from '@/components/assignee-select'
import { IssuePlanningFields } from '@/components/issue-planning-fields'
import { parseLabels } from '@/lib/issue-planning'
import { authClient } from '@/lib/auth-client'
import { issueStatusOptions, type IssueStatus } from '@/lib/issue-status'
import { useHydrated } from '@/lib/use-hydrated'
import { issuePriorityOptions } from '@/lib/issue-priority'
import * as Dialog from '@radix-ui/react-dialog'
import { LoaderCircle, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'

export function CreateIssueDialog() {
  const router = useRouter()
  const isHydrated = useHydrated()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<IssueStatus>('backlog')
  const [error, setError] = useState('')
  const [assigneesReady, setAssigneesReady] = useState(false)
  const [isSaving, startTransition] = useTransition()

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setAssigneesReady(false)
    setOpen(nextOpen)
    if (!nextOpen) {
      setError('')
      setStatus('backlog')
    }
  }

  async function handleSignIn() {
    await authClient.signIn.social({ provider: 'github', callbackURL: '/' })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      try {
        const result = await createIssueAction({
          title: formData.get('title'),
          description: formData.get('description'),
          status,
          priority: formData.get('priority'),
          assigneeId: formData.get('assigneeId') || null,
          labels: parseLabels(formData.get('labels')),
          dueDate: formData.get('dueDate') || null,
        })

        if (!result.ok) {
          setError(result.message)
          return
        }

        setOpen(false)
        setStatus('backlog')
        form.reset()
        router.refresh()
      } catch {
        setError('Não foi possível criar a issue. Tente de novo.')
      }
    })
  }

  if (!isHydrated || isSessionPending || !session?.user) {
    const isLoadingSession = !isHydrated || isSessionPending

    return (
      <Button
        type="button"
        onClick={handleSignIn}
        disabled={isLoadingSession}
        className="w-auto shrink-0 justify-center whitespace-nowrap bg-accent text-navy-950 hover:bg-accent/90"
      >
        {isLoadingSession ? 'Carregando sessão…' : 'Entrar para gerir'}
      </Button>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          className="w-auto shrink-0 justify-center whitespace-nowrap bg-accent text-navy-950 hover:bg-accent/90"
        >
          <Plus aria-hidden="true" className="size-4" />
          Nova issue
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-navy-500 bg-navy-800 p-5 shadow-2xl shadow-black/30 focus:outline-none sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Dialog.Title className="text-lg font-semibold text-navy-50">
                Criar issue
              </Dialog.Title>
              <Dialog.Description className="text-sm text-navy-300">
                Registre uma tarefa para acompanhar no quadro.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Fechar"
                className="rounded-md p-2 text-navy-300 outline-none hover:bg-navy-700 hover:text-navy-50 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <form key={open ? 'open' : 'closed'} className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-sm font-medium text-navy-100">
              Título
              <Input
                name="title"
                required
                autoFocus
                placeholder="Ex.: Melhorar a busca do quadro"
                className="w-full"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-navy-100">
              Descrição
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Descreva o que precisa ser feito."
                className="w-full resize-y rounded-md border border-navy-500 bg-navy-900 px-3 py-2.5 text-sm leading-6 text-navy-50 outline-none placeholder:text-navy-400 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-navy-100">
              Estado inicial
              <Select
                value={status}
                onChange={(event) => setStatus(event.target.value as IssueStatus)}
                className="h-10 w-full rounded-md border border-navy-500 bg-navy-900 pl-3 pr-10 text-sm text-navy-50 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
              >
                {issueStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-2 text-sm font-medium text-navy-100">
              Prioridade
              <Select name="priority" defaultValue="medium" className="h-10 w-full rounded-md border border-navy-500 bg-navy-900 pl-3 pr-10 text-sm text-navy-50 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30">
                {issuePriorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            </label>

            <AssigneeSelect onReady={setAssigneesReady} />
            <IssuePlanningFields />

            {error && (
              <p role="alert" className="text-sm text-amber-300">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-navy-600 pt-4 sm:flex-row sm:justify-end">
              <Dialog.Close asChild>
                <Button type="button" className="justify-center bg-transparent hover:bg-navy-700">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={isSaving || !assigneesReady}
                className="justify-center bg-accent text-navy-950 hover:bg-accent/90"
              >
                {isSaving ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : null}
                Criar issue
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
