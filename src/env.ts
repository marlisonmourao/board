import { z } from "zod"

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().optional(),
})

export const clientEnv = clientEnvSchema.parse(process.env)
