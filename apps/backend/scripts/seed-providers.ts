/**
 * Seed payment providers into the database.
 *
 * Usage: npx tsx scripts/seed-providers.ts
 *
 * This is the CI/CD counterpart of the provider loader's DB upsert,
 * which is skipped on the workerd runtime. Run this script against
 * the production database before deploying to Workers.
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { DRIZZLE_OPTIONS } from '../src/core/db/config.js'
import { env } from '../src/env.js'
import { syncPaymentProviders } from '../src/modules/payment/index.js'

const client = postgres(env.POOLER_DATABASE_URL, { prepare: false })
const db = drizzle(client, DRIZZLE_OPTIONS)

await syncPaymentProviders(() => db)

console.log('Seeded payment providers')
await client.end()
