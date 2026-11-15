import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { eq } from "drizzle-orm"
import type { AuthSession } from "../auth"
import { db } from "../db"
import { comments, issues, issueActivity, users } from "../db/schema"
import { requireAuth } from "../middlewares/auth"
import { IssuePrioritySchema } from "@/lib/issue-priority"

const IssueStatusSchema = z.enum(["backlog", "todo", "in_progress", "done"])

const UpdateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: IssueStatusSchema.optional(),
  priority: IssuePrioritySchema.optional(),
  assigneeId: z.uuidv4().nullable().optional(),
})

const IssueSchema = z.object({
  id: z.uuidv4(),
  issueNumber: z.number().int(),
  title: z.string(),
  description: z.string(),
  status: IssueStatusSchema,
  priority: IssuePrioritySchema,
  assigneeId: z.uuidv4().nullable(),
  likes: z.number().int(),
  comments: z.number().int(),
  createdAt: z.string().datetime(),
})

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
})

const ParamsSchema = z.object({
  id: z.uuidv4().openapi({
    param: { name: "id", in: "path" },
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
})

const route = createRoute({
  method: "patch",
  path: "/issues/{id}",
  middleware: [requireAuth],
  request: {
    params: ParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateIssueSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: IssueSchema,
        },
      },
      description: "Issue updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Issue not found",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Authentication required",
    },
  },
})

const app = new OpenAPIHono<{
  Variables: {
    user: AuthSession["user"] | null
    session: AuthSession["session"] | null
  }
}>()

export const updateIssue = app.openapi(route, async (c) => {
  const { id } = c.req.valid("param")
  const body = c.req.valid("json")

  const issue = await db.transaction(async (tx) => {
    const [previous] = await tx.select().from(issues).where(eq(issues.id, id)).for('update')
    if (!previous) return null

    const [updated] = await tx.update(issues).set(body).where(eq(issues.id, id)).returning()
    const actorName = c.get('user')!.name
    const changes: { issueId: string; actorName: string; field: string; oldValue: string | null; newValue: string | null }[] = []
    for (const field of ['title', 'description', 'status', 'priority'] as const) {
      if (previous[field] !== updated[field]) changes.push({ issueId: id, actorName, field, oldValue: previous[field], newValue: updated[field] })
    }
    if (previous.assigneeId !== updated.assigneeId) {
      const nameFor = async (userId: string | null) => {
        if (!userId) return null
        const [user] = await tx.select({ name: users.name }).from(users).where(eq(users.id, userId))
        return user?.name ?? null
      }
      changes.push({ issueId: id, actorName, field: 'assignee', oldValue: await nameFor(previous.assigneeId), newValue: await nameFor(updated.assigneeId) })
    }
    if (changes.length) await tx.insert(issueActivity).values(changes)
    return updated
  })

  if (!issue) {
    return c.json(
      {
        error: "Issue not found",
        message: `Issue with id ${id} does not exist`,
      },
      404,
    )
  }

  const commentCount = await db.$count(comments, eq(comments.issueId, id))

  return c.json(
    {
      id: issue.id,
      issueNumber: issue.issueNumber,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      assigneeId: issue.assigneeId,
      likes: issue.likes,
      comments: commentCount,
      createdAt: issue.createdAt.toISOString(),
    },
    200,
  )
})
