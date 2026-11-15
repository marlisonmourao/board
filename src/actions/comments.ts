'use server'

import { clientEnv } from '@/env'
import { getCookiesFromHeaders } from '@/http/utils/get-cookies-from-headers'
import { updateTag } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'

export async function changeCommentAction(input: unknown) {
  const parsed = z.object({ issueId: z.uuidv4(), commentId: z.uuidv4(), text: z.string().trim().min(1).optional() }).safeParse(input)
  if (!parsed.success) return { ok: false, message: 'Confira o comentário.' }
  const { issueId, commentId, text } = parsed.data
  const response = await fetch(new URL(`/api/issues/${issueId}/comments/${commentId}`, clientEnv.NEXT_PUBLIC_API_URL), {
    method: text === undefined ? 'DELETE' : 'PATCH',
    headers: getCookiesFromHeaders(await headers()),
    ...(text === undefined ? {} : { body: JSON.stringify({ text }) }),
  })
  if (!response.ok) return { ok: false, message: response.status === 401 ? 'Entre novamente para continuar.' : response.status === 403 ? 'Você só pode alterar seus próprios comentários.' : 'Não foi possível alterar o comentário.' }
  updateTag(`${issueId}-comments`)
  updateTag('issues')
  return { ok: true }
}
