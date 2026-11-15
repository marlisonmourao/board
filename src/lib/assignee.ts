import { z } from 'zod'

export const AssigneeSchema = z.object({ id: z.uuidv4(), name: z.string() })
export type Assignee = z.infer<typeof AssigneeSchema>
