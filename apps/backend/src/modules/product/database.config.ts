import { defineConfig } from 'drizzle-kit'
import { env } from '../../env.js'

export default defineConfig({
  schema: './src/modules/product/models/*.ts',
  out: './src/modules/product/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  migrations: { table: 'migrations_product' },
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
