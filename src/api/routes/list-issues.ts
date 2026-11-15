import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { eq, ilike } from "drizzle-orm"
import { db } from "../db"
import { comments, issues, users } from "../db/schema"
import { IssuePrioritySchema } from "@/lib/issue-priority"
import { AssigneeSchema } from "@/lib/assignee"

export const IssueStatusSchema = z.enum([
  "backlog",
  "todo",
  "in_progress",
  "done",
])

export const IssueCardSchema = z.object({
  id: z.string(),
  issueNumber: z.number().int(),
  title: z.string(),
  status: IssueStatusSchema,
  priority: IssuePrioritySchema,
  assignee: AssigneeSchema.nullable(),
  comments: z.number().int(),
})

export const IssuesListResponseSchema = z.object({
  backlog: z.array(IssueCardSchema),
  todo: z.array(IssueCardSchema),
  in_progress: z.array(IssueCardSchema),
  done: z.array(IssueCardSchema),
})

const route = createRoute({
  method: "get",
  path: "/issues",
  request: {
    query: z.object({
      status: IssueStatusSchema.optional(),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: IssuesListResponseSchema,
        },
      },
      description: "List of issues grouped by status",
    },
  },
})

export const listIssues = new OpenAPIHono().openapi(route, async (c) => {
  const { status, search } = c.req.valid("query")

  let query = db.select({ issue: issues, assignee: { id: users.id, name: users.name } }).from(issues).leftJoin(users, eq(issues.assigneeId, users.id))

  if (status) {
    query = query.where(eq(issues.status, status)) as typeof query
  }

  if (search) {
    query = query.where(ilike(issues.title, `%${search}%`)) as typeof query
  }

  const allIssues = await query

  // Get comment counts for all issues
  const issuesWithCounts = await Promise.all(
    allIssues.map(async ({ issue, assignee }) => {
      const commentCount = await db.$count(
        comments,
        eq(comments.issueId, issue.id),
      )
      return {
        id: issue.id,
        issueNumber: issue.issueNumber,
        title: issue.title,
        status: issue.status,
        priority: issue.priority,
        assignee,
        comments: commentCount,
      }
    }),
  )

  const grouped = {
    backlog: issuesWithCounts.filter((issue) => issue.status === "backlog"),
    todo: issuesWithCounts.filter((issue) => issue.status === "todo"),
    in_progress: issuesWithCounts.filter(
      (issue) => issue.status === "in_progress",
    ),
    done: issuesWithCounts.filter((issue) => issue.status === "done"),
  }

  return c.json(grouped, 200)
})
