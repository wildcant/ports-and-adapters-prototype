import { defineConfig } from 'drizzle-kit'
import { env } from '../../env.js'

export default defineConfig({
  schema: './src/modules/inventory/models/*.ts',
  out: './src/modules/inventory/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  migrations: { table: 'migrations_inventory' },
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
