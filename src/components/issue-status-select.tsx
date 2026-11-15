'use client'

import { updateIssueStatusAction } from '@/actions/issues'
import { authClient } from '@/lib/auth-client'
import { Select } from '@/components/select'
import { getIssueStatus, issueStatusOptions, type IssueStatus } from '@/lib/issue-status'
import { useHydrated } from '@/lib/use-hydrated'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface IssueStatusSelectProps {
  issueId: string
  issueNumber?: number
  status: IssueStatus
  compact?: boolean
  onSaved?: (status: IssueStatus) => void
}

export function IssueStatusSelect({
  issueId,
  issueNumber,
  status,
  compact = false,
  onSaved,
}: IssueStatusSelectProps) {
  const router = useRouter()
  const isHydrated = useHydrated()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const [isUpdating, startTransition] = useTransition()
  const [error, setError] = useState('')
  const currentStatus = getIssueStatus(status)

  if (!isHydrated || isSessionPending || !session?.user) {
    return (
      <span className={`inline-flex items-center gap-2 text-xs ${currentStatus.tone}`}>
        <span className={`size-1.5 rounded-full ${currentStatus.dot}`} />
        {currentStatus.label}
      </span>
    )
  }

  function handleChange(nextStatus: IssueStatus) {
    if (nextStatus === status) return
    setError('')

    startTransition(async () => {
      try {
        const result = await updateIssueStatusAction({ id: issueId, status: nextStatus })

        if (!result.ok) {
          setError(result.message)
          return
        }

        onSaved?.(nextStatus)
        router.refresh()
      } catch {
        setError('Não foi possível alterar o estado. Tente de novo.')
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <label className="sr-only" htmlFor={`issue-status-${issueId}`}>
        Mover issue {issueNumber ? `ISS-${issueNumber}` : ''} para outro estado
      </label>
      <Select
        compact={compact}
        id={`issue-status-${issueId}`}
        value={status}
        onChange={(event) => handleChange(event.target.value as IssueStatus)}
        disabled={isUpdating}
        aria-label={`Estado da issue${issueNumber ? ` ISS-${issueNumber}` : ''}`}
        className={`max-w-full cursor-pointer rounded-md border border-navy-600 bg-navy-900 text-xs ${currentStatus.tone} outline-none transition-colors hover:border-navy-400 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-wait disabled:opacity-60 ${compact ? 'py-1.5 pl-2 pr-9' : 'py-2 pl-2.5 pr-10'}`}
      >
        {issueStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {error && <span role="status" className="text-xs text-amber-300">{error}</span>}
    </div>
  )
}
