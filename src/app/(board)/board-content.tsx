'use client'

import type { IssuesListResponseSchema } from '@/api/routes/list-issues'
import { Card } from '@/components/card'
import { LikeButton } from '@/components/like-button'
import { Section } from '@/components/section'
import { Select } from '@/components/select'
import { IssueStatusSelect } from '@/components/issue-status-select'
import { getIssueStatus, issueStatusOptions } from '@/lib/issue-status'
import { getIssuePriority, issuePriorityOptions } from '@/lib/issue-priority'
import { getIssueInteractions } from '@/http/get-issue-interections'
import { useQuery } from '@tanstack/react-query'
import { Archive, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type z from 'zod'

interface BoardContentProps {
  issues: z.infer<typeof IssuesListResponseSchema>
}

export function BoardContent({ issues }: BoardContentProps) {
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const allIssues = issueStatusOptions.flatMap((status) => issues[status.value])
  const assignees = Array.from(new Map(allIssues.flatMap((issue) => issue.assignee ? [[issue.assignee.id, issue.assignee] as const] : [])).values())
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id))
  const filteredIssues = Object.fromEntries(issueStatusOptions.map(({ value }) => [value, issues[value].filter((issue) =>
    (!priorityFilter || issue.priority === priorityFilter) &&
    (!assigneeFilter || (assigneeFilter === 'unassigned' ? !issue.assignee : issue.assignee?.id === assigneeFilter)),
  )])) as typeof issues
  const [activeStatus, setActiveStatus] = useState<(typeof issueStatusOptions)[number]['value']>(
    () => issueStatusOptions.find((status) => issues[status.value].length > 0)?.value ?? 'backlog',
  )
  const allIssuesIds = [
    ...filteredIssues.backlog.map((issue) => issue.id),
    ...filteredIssues.todo.map((issue) => issue.id),
    ...filteredIssues.in_progress.map((issue) => issue.id),
    ...filteredIssues.done.map((issue) => issue.id),
  ]

  const { data: interactionsData } = useQuery({
    queryKey: ['issue-likes', ...allIssuesIds.slice().sort().join(',')],
    queryFn: () => getIssueInteractions({ issueIds: allIssuesIds }),
  })

  const interactions = useMemo(() => {
    return new Map(
      (interactionsData?.interactions ?? []).map((interaction) => [
        interaction.issueId,
        { isLiked: interaction.isLiked, likesCount: interaction.likesCount },
      ]),
    )
  }, [interactionsData])

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs text-navy-200">Prioridade
          <Select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="h-10 w-full min-w-40 rounded-md border border-navy-500 bg-navy-900 pl-3 pr-10 text-sm text-navy-50 focus-visible:ring-2 focus-visible:ring-accent">
            <option value="">Todas as prioridades</option>
            {issuePriorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        </label>
        <label className="space-y-1 text-xs text-navy-200">Responsável
          <Select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} className="h-10 w-full min-w-44 rounded-md border border-navy-500 bg-navy-900 pl-3 pr-10 text-sm text-navy-50 focus-visible:ring-2 focus-visible:ring-accent">
            <option value="">Todos os responsáveis</option>
            <option value="unassigned">Sem responsável</option>
            {assignees.map((person) => <option key={person.id} value={person.id}>{person.name}{assignees.filter((other) => other.name === person.name).length > 1 ? ` (${person.id.slice(0, 8)})` : ''}</option>)}
          </Select>
        </label>
        {(priorityFilter || assigneeFilter) && <button type="button" onClick={() => { setPriorityFilter(''); setAssigneeFilter('') }} className="rounded-md px-3 py-2 text-sm text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Limpar filtros</button>}
      </div>
      <nav aria-label="Filtrar issues por estado" className="flex gap-2 overflow-x-auto pb-1 md:hidden">
        {issueStatusOptions.map((status) => {
          const active = activeStatus === status.value
          const count = filteredIssues[status.value].length

          return (
            <button
              key={status.value}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveStatus(status.value)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${active ? 'border-navy-400 bg-navy-700 text-navy-50' : 'border-navy-600 bg-navy-800 text-navy-300 hover:text-navy-100'}`}
            >
              <span className={`size-1.5 rounded-full ${status.dot}`} />
              {status.label}
              <span className="text-xs tabular-nums text-navy-300">{count}</span>
            </button>
          )
        })}
      </nav>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {issueStatusOptions.map((status) => {
          const statusIssues = filteredIssues[status.value]
          const visibleOnMobile = activeStatus === status.value

          return (
            <Section.Root
              key={status.value}
              role="region"
              aria-label={`Coluna: ${status.label}`}
              className={`${visibleOnMobile ? 'flex' : 'hidden'} h-[calc(100dvh-300px)] min-h-[340px] md:flex md:h-[calc(100dvh-260px)] md:min-h-[420px]`}
            >
              <Section.Header>
                <Section.Title className={status.tone}>
                  <span className={`size-2 rounded-full ${status.dot}`} />
                  {status.label}
                </Section.Title>
                <Section.IssueCount>{statusIssues.length}</Section.IssueCount>
              </Section.Header>

              <Section.Content>
                {statusIssues.length > 0 ? (
                  statusIssues.map((issue) => {
                    const interaction = interactions.get(issue.id)
                    const issueStatus = getIssueStatus(issue.status)
                    const priority = getIssuePriority(issue.priority)

                    return (
                      <Card.Root key={issue.id}>
                        <Card.Link href={`/issues/${issue.id}`}>
                          <Card.Header>
                            <Card.Number>ISS-{issue.issueNumber}</Card.Number>
                            <Card.Title>{issue.title}</Card.Title>
                            <span className={`text-xs ${priority.color}`}>Prioridade {priority.label.toLowerCase()}</span>
                            <span className="text-xs text-navy-300">Responsável: {issue.assignee?.name ?? 'Sem responsável'}</span>
                          </Card.Header>
                        </Card.Link>

                        <Card.Footer className="mt-4 border-t border-navy-600/70 pt-3">
                          <LikeButton
                            issueId={issue.id}
                            initialLikes={interaction?.likesCount ?? 0}
                            initialLiked={interaction?.isLiked ?? false}
                            aria-label={`Curtir issue ISS-${issue.issueNumber}`}
                            className="bg-navy-700 px-2 py-1.5 text-xs hover:bg-navy-600"
                          />

                          <Link
                            href={`/issues/${issue.id}`}
                            aria-label={`${issue.comments} comentários na issue ISS-${issue.issueNumber}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-navy-700 px-2 py-1.5 text-xs text-navy-200 outline-none hover:bg-navy-600 focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            <MessageCircle aria-hidden="true" className="size-3.5" />
                            {issue.comments}
                          </Link>

                          <div className="ml-auto">
                            <IssueStatusSelect
                              issueId={issue.id}
                              issueNumber={issue.issueNumber}
                              status={issueStatus.value}
                              onSaved={setActiveStatus}
                              compact
                            />
                          </div>
                        </Card.Footer>
                      </Card.Root>
                    )
                  })
                ) : (
                  <div className="flex min-h-40 flex-col items-center justify-center px-5 text-center">
                    <Archive aria-hidden="true" className="mb-3 size-5 text-navy-400" />
                    <p className="text-sm font-medium text-navy-200">
                      {Object.values(filteredIssues).every((group) => group.length === 0)
                        ? 'Nenhuma issue encontrada'
                        : 'Nenhuma issue neste estado'}
                    </p>
                    <p className="mt-1 max-w-[220px] text-xs leading-5 text-navy-400">
                      {Object.values(filteredIssues).every((group) => group.length === 0)
                        ? 'Ajuste a busca ou os filtros para ver issues.'
                        : 'Issues movidas para cá aparecerão nesta coluna.'}
                    </p>
                  </div>
                )}
              </Section.Content>
            </Section.Root>
          )
        })}
      </div>
    </main>
  )
}
