'use client'

import { editIssueAction } from '@/actions/issues'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { AssigneeSelect } from '@/components/assignee-select'
import type { Assignee } from '@/lib/assignee'
import { issuePriorityOptions, type IssuePriority } from '@/lib/issue-priority'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'

interface IssueEditorProps {
  id: string
  title: string
  description: string
  priority: IssuePriority
  assignee: Assignee | null
  isAuthenticated: boolean
}

export function IssueEditor({ id, title, description, priority, assignee, isAuthenticated }: IssueEditorProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [assigneesReady, setAssigneesReady] = useState(false)
  const [saving, startTransition] = useTransition()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setError('')
    startTransition(async () => {
      try {
        const result = await editIssueAction({ id, title: data.get('title'), description: data.get('description'), priority: data.get('priority'), assigneeId: data.get('assigneeId') || null })
        if (!result.ok) {
          setError(result.message)
          return
        }
        setEditing(false)
        router.refresh()
      } catch {
        setError('Não foi possível salvar. Tente de novo.')
      }
    })
  }

  if (editing) {
    return (
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-2 text-sm font-medium text-navy-100">
          Título
          <Input name="title" defaultValue={title} required autoFocus className="w-full" />
        </label>
        <label className="block space-y-2 text-sm font-medium text-navy-100">
          Descrição
          <textarea name="description" defaultValue={description} required rows={5} className="w-full resize-y rounded-md border border-navy-500 bg-navy-900 px-3 py-2.5 text-sm leading-6 text-navy-50 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30" />
        </label>
        <label className="block space-y-2 text-sm font-medium text-navy-100">
          Prioridade
          <Select name="priority" defaultValue={priority} className="h-10 w-full rounded-md border border-navy-500 bg-navy-900 pl-3 pr-10 text-sm text-navy-50 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30">
            {issuePriorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        </label>
        <AssigneeSelect value={assignee?.id} onReady={setAssigneesReady} />
        {error && <p role="alert" className="text-sm text-amber-300">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving || !assigneesReady} className="bg-accent text-navy-950 hover:bg-accent/90">{saving ? 'Salvando…' : 'Salvar alterações'}</Button>
          <Button type="button" disabled={saving} onClick={() => { setEditing(false); setError('') }}>Cancelar</Button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <h1 className="max-w-[48rem] text-2xl font-semibold tracking-tight text-navy-50 sm:text-3xl">{title}</h1>
        {isAuthenticated && <Button type="button" onClick={() => { setAssigneesReady(false); setEditing(true) }} className="shrink-0 text-sm"><Pencil aria-hidden="true" className="size-4" />Editar</Button>}
      </div>
      <p className="max-w-[72ch] whitespace-pre-wrap text-sm leading-7 text-navy-200">{description}</p>
    </div>
  )
}
