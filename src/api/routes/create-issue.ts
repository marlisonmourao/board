import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import type { AuthSession } from "../auth"
import { db } from "../db"
import { issues } from "../db/schema"
import { requireAuth } from "../middlewares/auth"

const IssueStatusSchema = z.enum(["backlog", "todo", "in_progress", "done"])

const CreateIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: IssueStatusSchema.optional().default("backlog"),
})

const IssueSchema = z.object({
  id: z.uuidv4(),
  issueNumber: z.number().int(),
  title: z.string(),
  description: z.string(),
  status: IssueStatusSchema,
  likes: z.number().int(),
  comments: z.number().int(),
  createdAt: z.string().datetime(),
})

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
})

const route = createRoute({
  method: "post",
  path: "/issues",
  middleware: [requireAuth],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateIssueSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: IssueSchema,
        },
      },
      description: "Issue created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Validation failed",
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

export const createIssue = app.openapi(route, async (c) => {
  const body = c.req.valid("json")

  const [issue] = await db
    .insert(issues)
    .values({
      title: body.title,
      description: body.description,
      status: body.status,
    })
    .returning()

  return c.json(
    {
      id: issue.id,
      issueNumber: issue.issueNumber,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      likes: issue.likes,
      comments: 0,
      createdAt: issue.createdAt.toISOString(),
    },
    201,
  )
})
