import { z } from 'zod'

const envSchema = z.object({
  VITE_BACKEND_URL: z.url(),
})

function createEnv() {
  const result = envSchema.safeParse(import.meta.env)

  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment variables:\n${issues}`)
  }

  return result.data
}

export const env = createEnv()
