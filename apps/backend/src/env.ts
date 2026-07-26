import { z } from 'zod'

const envSchema = z.object({
  POOLER_DATABASE_URL: z.string(),
  DIRECT_DATABASE_URL: z.string().default(''),
  MIGRATING: z.coerce.boolean().default(false),
  RUNTIME: z.enum(['node', 'workerd']).default('node'),
  NODE_ENV: z.string().default('development'),
  LOG_LEVEL: z.string().default('http'),
  LOG_FILE: z.string().default(''),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
})

function createEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment variables:\n${issues}`)
  }

  const env = {
    ...result.data,
    DATABASE_URL: result.data.MIGRATING ? result.data.DIRECT_DATABASE_URL : result.data.POOLER_DATABASE_URL,
  }

  return env
}

export const env = createEnv()
