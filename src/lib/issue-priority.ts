import { z } from 'zod'

export const IssuePrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])
export type IssuePriority = z.infer<typeof IssuePrioritySchema>

export const issuePriorityOptions: { value: IssuePriority; label: string; color: string }[] = [
  { value: 'low', label: 'Baixa', color: 'text-navy-200' },
  { value: 'medium', label: 'Média', color: 'text-blue-300' },
  { value: 'high', label: 'Alta', color: 'text-amber-300' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-300' },
]

export function getIssuePriority(priority: IssuePriority) {
  return issuePriorityOptions.find((option) => option.value === priority)!
}
