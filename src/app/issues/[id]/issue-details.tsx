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

      <IssueEditor id={issue.id} title={issue.title} description={issue.description} priority={issue.priority} isAuthenticated={isAuthenticated} />

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
