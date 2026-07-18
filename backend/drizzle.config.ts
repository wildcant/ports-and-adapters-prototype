import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/modules/identity/adapters/drizzle/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './dev.db',
  },
})
