export const issueStatusOptions = [
  { value: 'backlog', label: 'Fila', tone: 'text-status-backlog', dot: 'bg-status-backlog' },
  { value: 'todo', label: 'A fazer', tone: 'text-status-todo', dot: 'bg-status-todo' },
  { value: 'in_progress', label: 'Em andamento', tone: 'text-status-progress', dot: 'bg-status-progress' },
  { value: 'done', label: 'Concluído', tone: 'text-status-done', dot: 'bg-status-done' },
] as const

export type IssueStatus = (typeof issueStatusOptions)[number]['value']

export function getIssueStatus(status: IssueStatus) {
  return issueStatusOptions.find((option) => option.value === status)!
}
