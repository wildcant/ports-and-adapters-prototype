/**
 * DB ADAPTER -- Creates a Drizzle instance backed by Supabase Postgres via postgres.js.
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../../../../env.js'

export const createDb = () => {
  const client = postgres(env.SUPABASE_DATABASE_URL, { prepare: false })
  return drizzle(client)
}
