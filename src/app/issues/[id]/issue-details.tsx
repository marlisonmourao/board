import { createCommente } from '@/http/create-comment'
import { getIssue } from '@/http/get-issue'
import { authClient } from '@/lib/auth-client'
import { IssueStatusSelect } from '@/components/issue-status-select'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { IssueCommentList } from './comment/issue-comment-list'
import { IssueCommentSkeleton } from './comment/issue-comment-skeleton'
import { IssueCommentForm } from './issue-comment-form'
import { IssueLikeButton } from './issue-like-button'
import { IssueEditor } from './issue-editor'
import { DeleteIssueDialog } from './delete-issue-dialog'
import { getIssuePriority } from '@/lib/issue-priority'
import { IssuePlanningDisplay } from '@/components/issue-planning-fields'
import { getIssueStatus, type IssueStatus } from '@/lib/issue-status'
import type { IssuePriority } from '@/lib/issue-priority'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface IssueDetailsProps {
  issueId: string
}

export async function IssueDetails({ issueId }: IssueDetailsProps) {
  const issue = await getIssue({ id: issueId })

  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  })

  const isAuthenticated = !!session?.user
  const priority = getIssuePriority(issue.priority)

  async function handleCreateComment(text: string) {
    'use server'

    await createCommente({ issueId, text })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-navy-600 bg-navy-900 px-2.5 py-1.5 text-xs font-medium tabular-nums text-navy-200">
          ISS-{issue.issueNumber}
        </span>
        <IssueStatusSelect issueId={issue.id} status={issue.status} />
        <span className={`text-xs ${priority.color}`}>Prioridade {priority.label.toLowerCase()}</span>
        <IssueLikeButton issueId={issue.id} />
        {isAuthenticated && <div className="ml-auto"><DeleteIssueDialog id={issue.id} issueNumber={issue.issueNumber} /></div>}
      </div>

      <IssueEditor id={issue.id} title={issue.title} description={issue.description} priority={issue.priority} assignee={issue.assignee} labels={issue.labels} dueDate={issue.dueDate} isAuthenticated={isAuthenticated} />
      <IssuePlanningDisplay labels={issue.labels} dueDate={issue.dueDate} />

      <p className="text-sm text-navy-200">Responsável: {issue.assignee?.name ?? 'Sem responsável'}</p>

      <section aria-labelledby="activity-heading" className="space-y-3 border-t border-navy-600 pt-5">
        <h2 id="activity-heading" className="font-semibold text-navy-50">Histórico</h2>
        {issue.activity.length === 0 ? <p className="text-sm text-navy-300">Nenhuma alteração registrada.</p> : (
          <ol className="space-y-3">
            {issue.activity.map((entry) => {
              const fields: Record<string, string> = { title: 'título', description: 'descrição', status: 'estado', priority: 'prioridade', assignee: 'responsável', labels: 'etiquetas', dueDate: 'prazo' }
              const label = (value: string | null) => {
                if (!value) return entry.field === 'assignee' ? 'Sem responsável' : 'Não definido'
                if (entry.field === 'dueDate') return value.split('-').reverse().join('/')
                if (entry.field === 'status') return getIssueStatus(value as IssueStatus)?.label ?? value
                if (entry.field === 'priority') return getIssuePriority(value as IssuePriority)?.label ?? value
                return value
              }
              return (
                <li key={entry.id} className="text-sm text-navy-200">
                  <span className="font-medium text-navy-100">{entry.actorName}</span> alterou {fields[entry.field] ?? entry.field}
                  {entry.field !== 'description' && <> de <span className="text-navy-50">{label(entry.oldValue)}</span> para <span className="text-navy-50">{label(entry.newValue)}</span></>}
                  <time dateTime={entry.createdAt} className="mt-1 block text-xs text-navy-300">{format(new Date(entry.createdAt), "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</time>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="comments-heading" className="flex flex-col gap-3 border-t border-navy-600 pt-5">
        <h2 id="comments-heading" className="font-semibold text-navy-50">Comentários</h2>

        <IssueCommentForm
          onCreateComment={handleCreateComment}
          isAuthenticated={isAuthenticated}
        />

        <div className="mt-3">
          <Suspense fallback={<IssueCommentSkeleton />}>
            <IssueCommentList issueId={issue.id} />
          </Suspense>
        </div>
      </section>
    </>
  )
}
