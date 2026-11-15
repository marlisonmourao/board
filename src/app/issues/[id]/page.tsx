import { getIssue } from '@/http/get-issue'
import { MoveLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { IssueDetails } from './issue-details'

interface IssuePageProps {
  params: Promise<{ id: string }>
}

export const generateMetadata = async ({ params }: IssuePageProps) => {
  const { id } = await params

  const issue = await getIssue({ id })

  return {
    title: `Detalhes: ${issue.title}`,
  }
}

export default async function IssuePage({ params }: IssuePageProps) {
  const { id } = await params

  return (
    <main className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 rounded-xl border border-navy-600 bg-navy-800/80 p-5 sm:p-8">
      <Link
        href="/"
        className="flex w-fit items-center gap-2 rounded-sm text-navy-200 outline-none transition-colors hover:text-navy-100 focus-visible:ring-2 focus-visible:ring-accent"
      >
        <MoveLeftIcon className="size-4" />
        <span className="text-xs">Voltar ao quadro</span>
      </Link>

      <IssueDetails issueId={id} />
    </main>
  )
}
