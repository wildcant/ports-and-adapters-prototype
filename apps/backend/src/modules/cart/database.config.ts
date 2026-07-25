import { defineConfig } from 'drizzle-kit'
import { env } from '../../env.js'

export default defineConfig({
  schema: './src/modules/cart/models/*.ts',
  out: './src/modules/cart/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  migrations: { table: 'migrations_cart' },
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
