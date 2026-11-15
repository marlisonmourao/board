import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { and, eq, ilike, sql } from "drizzle-orm"
import { db } from "../db"
import { comments, issues, users } from "../db/schema"
import { IssuePrioritySchema } from "@/lib/issue-priority"
import { AssigneeSchema } from "@/lib/assignee"
import { LabelsSchema, DueDateSchema } from "@/lib/issue-planning"

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
  labels: LabelsSchema,
  dueDate: DueDateSchema,
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

  const commentCounts = db
    .select({ issueId: comments.issueId, count: sql<number>`count(*)::int`.as('comment_count') })
    .from(comments)
    .groupBy(comments.issueId)
    .as('comment_counts')
  const allIssues = await db
    .select({ issue: issues, assignee: { id: users.id, name: users.name }, commentCount: sql<number>`coalesce(${commentCounts.count}, 0)::int` })
    .from(issues)
    .leftJoin(users, eq(issues.assigneeId, users.id))
    .leftJoin(commentCounts, eq(commentCounts.issueId, issues.id))
    .where(and(status ? eq(issues.status, status) : undefined, search ? ilike(issues.title, `%${search}%`) : undefined))
    .orderBy(issues.issueNumber)

  const issuesWithCounts = allIssues.map(({ issue, assignee, commentCount }) => ({
    id: issue.id,
    issueNumber: issue.issueNumber,
    title: issue.title,
    status: issue.status,
    priority: issue.priority,
    assignee,
    labels: issue.labels,
    dueDate: issue.dueDate,
    comments: commentCount,
  }))

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
