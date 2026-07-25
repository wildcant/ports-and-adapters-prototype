import { defineConfig } from 'drizzle-kit'
import { env } from '../env.js'

export default defineConfig({
  schema: [
    './src/link-modules/definitions/product-variant-inventory-item.ts',
    './src/link-modules/definitions/cart-payment-collection.ts',
  ],
  out: './src/link-modules/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  migrations: { table: 'migrations_links' },
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
