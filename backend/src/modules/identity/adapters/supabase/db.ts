/**
 * DB ADAPTER -- Creates a Drizzle instance backed by Supabase Postgres via postgres.js.
 */

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

export const createDb = () => {
  const connectionString = process.env.SUPABASE_DATABASE_URL
  if (!connectionString) {
    throw new Error("SUPABASE_DATABASE_URL environment variable is not set")
  }

  const client = postgres(connectionString, { prepare: false })
  return drizzle(client)
}
