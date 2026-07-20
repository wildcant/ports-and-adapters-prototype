import { defineConfig } from 'drizzle-kit'
import { env } from '../../env.js'

export default defineConfig({
  schema: './src/modules/user/models/*.ts',
  out: './src/modules/user/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.SUPABASE_DATABASE_URL,
  },
})
