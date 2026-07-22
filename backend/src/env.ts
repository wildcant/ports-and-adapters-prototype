import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z.string().default('development'),
  LOG_LEVEL: z.string().default('http'),
  LOG_FILE: z.string().default(''),
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
console.log({ env })
