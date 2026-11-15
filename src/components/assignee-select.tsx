'use client'

import { listAssigneesAction } from '@/actions/issues'
import type { Assignee } from '@/lib/assignee'
import { useEffect, useState } from 'react'
import { Select } from './select'

export function AssigneeSelect({ value = '', onReady }: { value?: string; onReady: (ready: boolean) => void }) {
  const [users, setUsers] = useState<Assignee[]>([])
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState(value)

  useEffect(() => {
    let active = true
    onReady(false)
    listAssigneesAction().then((result) => {
      if (active) { setUsers(result); onReady(true) }
    }).catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [onReady])

  return (
    <label className="block space-y-2 text-sm font-medium text-navy-100">
      Responsável
      <Select name="assigneeId" value={selected} onChange={(event) => setSelected(event.target.value)} disabled={error} className="h-10 w-full rounded-md border border-navy-500 bg-navy-900 pl-3 pr-10 text-sm text-navy-50 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30">
        <option value="">Sem responsável</option>
        {users.map((user) => <option key={user.id} value={user.id}>{user.name}{users.filter((candidate) => candidate.name === user.name).length > 1 ? ` (${user.id.slice(0, 8)})` : ''}</option>)}
      </Select>
      {error && <span role="alert" className="block text-xs text-amber-300">Não foi possível carregar os responsáveis. Feche e abra o formulário novamente.</span>}
    </label>
  )
}
