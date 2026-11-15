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
        <IssueLikeButton issueId={issue.id} />
      </div>

      <div className="space-y-2">
        <h1 className="max-w-[48rem] text-2xl font-semibold tracking-tight text-navy-50 sm:text-3xl">
          {issue.title}
        </h1>
        <p className="max-w-[72ch] text-sm leading-7 text-navy-200">
          {issue.description}
        </p>
      </div>

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
