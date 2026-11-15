import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { and, eq } from 'drizzle-orm'
import type { AuthSession } from '../auth'
import { db } from '../db'
import { issueLikes, issues } from '../db/schema'
import { requireAuth } from '../middlewares/auth'
import { LikeResponseSchema } from './schemas/issue-like'

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
})

const ParamsSchema = z.object({
  id: z.uuidv4().openapi({
    param: { name: 'id', in: 'path' },
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
})

const route = createRoute({
  method: 'post',
  path: '/issues/{id}/like',
  middleware: [requireAuth],
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LikeResponseSchema,
        },
      },
      description: 'Like toggled successfully',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Issue not found',
    },
  },
})

const app = new OpenAPIHono<{
  Variables: {
    user: AuthSession['user'] | null
    session: AuthSession['session'] | null
  }
}>()

export const toggleIssueLike = app.openapi(route, async (c) => {
  const { id } = c.req.valid('param')
  const user = c.get('user')

  const result = await db.transaction(async (tx) => {
    const [issue] = await tx.select({ id: issues.id }).from(issues).where(eq(issues.id, id)).for('update')
    if (!issue) return null
    const [existingLike] = await tx.select({ id: issueLikes.id }).from(issueLikes)
      .where(and(eq(issueLikes.issueId, id), eq(issueLikes.userId, user!.id)))
    if (existingLike) {
      await tx.delete(issueLikes).where(eq(issueLikes.id, existingLike.id))
    } else {
      await tx.insert(issueLikes).values({ issueId: id, userId: user!.id })
    }
    const likes = await tx.$count(issueLikes, eq(issueLikes.issueId, id))
    return { id, likes, liked: !existingLike }
  })

  if (!result) {
    return c.json(
      {
        error: 'Issue not found',
        message: `Issue with id ${id} does not exist`,
      },
      404,
    )
  }

  return c.json(result, 200)
})
