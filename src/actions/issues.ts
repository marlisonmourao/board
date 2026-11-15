'use server'

import { IssueSchema } from '@/api/routes/get-issue'
import { IssueStatusSchema } from '@/api/routes/list-issues'
import { clientEnv } from '@/env'
import { getCookiesFromHeaders } from '@/http/utils/get-cookies-from-headers'
import { updateTag } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'
import { IssuePrioritySchema } from '@/lib/issue-priority'

const CreateIssueInputSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  status: IssueStatusSchema,
  priority: IssuePrioritySchema.default('medium'),
})

const UpdateIssueInputSchema = z.object({
  id: z.uuidv4(),
  status: IssueStatusSchema,
})

const EditIssueInputSchema = z.object({
  id: z.uuidv4(),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  priority: IssuePrioritySchema,
})

export type IssueStatus = z.infer<typeof IssueStatusSchema>

export type IssueActionResult =
  | { ok: true }
  | { ok: false; message: string; loginRequired?: boolean }

async function requestIssue(path: string, method: 'POST' | 'PATCH', body: unknown) {
  const response = await fetch(new URL(path, clientEnv.NEXT_PUBLIC_API_URL), {
    method,
    body: JSON.stringify(body),
    headers: getCookiesFromHeaders(await headers()),
  })

  if (response.status === 401) {
    return { ok: false as const, message: 'Entre para gerir issues.', loginRequired: true }
  }

  if (!response.ok) {
    return {
      ok: false as const,
      message: response.status === 404
        ? 'Esta issue não existe mais.'
        : 'Não foi possível salvar. Tente de novo.',
    }
  }

  const data = await response.json()
  IssueSchema.parse(data)
  updateTag('issues')

  return { ok: true as const }
}

export async function createIssueAction(input: unknown): Promise<IssueActionResult> {
  const parsed = CreateIssueInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, message: 'Preencha título e descrição.' }
  }

  return requestIssue('/api/issues', 'POST', parsed.data)
}

export async function updateIssueStatusAction(input: unknown): Promise<IssueActionResult> {
  const parsed = UpdateIssueInputSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, message: 'Não foi possível alterar o estado.' }
  }

  return requestIssue(`/api/issues/${parsed.data.id}`, 'PATCH', {
    status: parsed.data.status,
  })
}

export async function editIssueAction(input: unknown): Promise<IssueActionResult> {
  const parsed = EditIssueInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'Preencha título e descrição.' }
  }

  const { id, title, description, priority } = parsed.data
  return requestIssue(`/api/issues/${id}`, 'PATCH', { title, description, priority })
}

export async function deleteIssueAction(input: unknown): Promise<IssueActionResult> {
  const parsed = z.uuidv4().safeParse(input)
  if (!parsed.success) return { ok: false, message: 'Issue inválida.' }

  const response = await fetch(new URL(`/api/issues/${parsed.data}`, clientEnv.NEXT_PUBLIC_API_URL), {
    method: 'DELETE',
    headers: getCookiesFromHeaders(await headers()),
  })

  if (response.status === 401) return { ok: false, message: 'Entre para excluir issues.', loginRequired: true }
  if (response.status === 404) return { ok: false, message: 'Esta issue não existe mais.' }
  if (!response.ok) return { ok: false, message: 'Não foi possível excluir a issue. Tente de novo.' }

  updateTag('issues')
  return { ok: true }
}
