import { z } from 'zod'

const envSchema = z.object({
  SUPABASE_DATABASE_URL: z.string().url(),
  DATABASE_URL: z.string().optional(),
})

function createEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment variables:\n${issues}`)
  }
  return result.data
}

export const env = createEnv()
