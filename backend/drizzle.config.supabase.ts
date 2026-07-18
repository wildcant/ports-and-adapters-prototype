import { defineConfig } from 'drizzle-kit'
import { env } from './src/env.js'

export default defineConfig({
  schema: './src/modules/identity/adapters/supabase/schema.ts',
  out: './drizzle-supabase',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.SUPABASE_DATABASE_URL,
  },
})
