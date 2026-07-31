import { defineConfig } from 'drizzle-kit'
import { env } from '../../env.js'

export default defineConfig({
  schema: './src/modules/fulfillment/models/*.ts',
  out: './src/modules/fulfillment/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  migrations: { table: 'migrations_fulfillment' },
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
