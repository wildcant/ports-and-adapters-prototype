import { defineConfig } from 'drizzle-kit'
import { env } from '../env.js'

export default defineConfig({
  schema: './src/link-modules/definitions/product-variant-inventory-item.ts',
  out: './src/link-modules/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
