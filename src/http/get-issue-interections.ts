import { IssueInteractionsResponseSchema } from '@/api/routes/schemas/issue-interactions'
import { clientEnv } from '@/env'

interface GetIssueInteractionsParams {
  issueIds: string[]
}

export async function getIssueInteractions({
  issueIds,
}: GetIssueInteractionsParams) {
  const batches = Array.from({ length: Math.ceil(issueIds.length / 100) }, (_, index) => issueIds.slice(index * 100, index * 100 + 100))
  const results = await Promise.all(batches.map(async (ids) => {
    const url = new URL('/api/issues/interactions', clientEnv.NEXT_PUBLIC_API_URL)
    url.searchParams.set('issueIds', ids.join(','))
    const response = await fetch(url, { credentials: 'include' })
    if (!response.ok) throw new Error('Não foi possível carregar as curtidas.')
    return IssueInteractionsResponseSchema.parse(await response.json())
  }))
  return { interactions: results.flatMap((result) => result.interactions) }
}
