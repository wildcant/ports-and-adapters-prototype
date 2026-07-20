import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from '@dotenvx/dotenvx'
import { z } from 'zod'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({
  path: [
    resolve(__dirname, '../../.env.test'),
    resolve(__dirname, '../../.env.local'),
    resolve(__dirname, '../../.env'),
  ],
  quiet: true,
})

const envSchema = z.object({
  SUPABASE_DATABASE_URL: z.url(),
  DATABASE_URL: z.string().optional(),
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
