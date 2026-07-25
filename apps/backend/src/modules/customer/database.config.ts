import { defineConfig } from 'drizzle-kit'
import { env } from '../../env.js'

export default defineConfig({
  schema: './src/modules/customer/models/*.ts',
  out: './src/modules/customer/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  migrations: { table: 'migrations_customer' },
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
