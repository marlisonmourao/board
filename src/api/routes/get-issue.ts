import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { desc, eq } from "drizzle-orm"
import { db } from "../db"
import { comments, issues, issueActivity, users } from "../db/schema"
import { IssuePrioritySchema } from "@/lib/issue-priority"
import { AssigneeSchema } from "@/lib/assignee"
import { LabelsSchema, DueDateSchema } from "@/lib/issue-planning"

export const IssueStatusSchema = z.enum([
  "backlog",
  "todo",
  "in_progress",
  "done",
])

export const IssueSchema = z.object({
  id: z.uuidv4(),
  issueNumber: z.number().int(),
  title: z.string(),
  description: z.string(),
  status: IssueStatusSchema,
  priority: IssuePrioritySchema,
  assignee: AssigneeSchema.nullable(),
  labels: LabelsSchema,
  dueDate: DueDateSchema,
  comments: z.number().int(),
  activity: z.array(z.object({ id: z.uuidv4(), actorName: z.string(), field: z.string(), oldValue: z.string().nullable(), newValue: z.string().nullable(), createdAt: z.string().datetime() })),
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
  method: "get",
  path: "/issues/{id}",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: IssueSchema,
        },
      },
      description: "Issue details",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Issue not found",
    },
  },
})

export const getIssue = new OpenAPIHono().openapi(route, async (c) => {
  const { id } = c.req.valid("param")

  const [result] = await db.select({ issue: issues, assignee: { id: users.id, name: users.name } }).from(issues).leftJoin(users, eq(issues.assigneeId, users.id)).where(eq(issues.id, id))

  if (!result) {
    return c.json(
      {
        error: "Issue not found",
        message: `Issue with id ${id} does not exist`,
      },
      404,
    )
  }

  const { issue, assignee } = result

  const commentCount = await db.$count(comments, eq(comments.issueId, id))
  const activity = await db.select().from(issueActivity).where(eq(issueActivity.issueId, id)).orderBy(desc(issueActivity.createdAt), desc(issueActivity.id))

  return c.json(
    {
      id: issue.id,
      issueNumber: issue.issueNumber,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      assignee,
      labels: issue.labels,
      dueDate: issue.dueDate,
      comments: commentCount,
      activity: activity.map(({ id, actorName, field, oldValue, newValue, createdAt }) => ({ id, actorName, field, oldValue, newValue, createdAt: createdAt.toISOString() })),
      createdAt: issue.createdAt.toISOString(),
    },
    200,
  )
})
