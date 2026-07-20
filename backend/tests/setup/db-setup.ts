import { join } from 'node:path'
import { sql as dsql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { afterAll, beforeEach } from 'vitest'
import { env } from '../../src/env.js'

const sql = postgres(env.SUPABASE_DATABASE_URL, { prepare: false })
export const db = drizzle(sql)

const migrationsRoot = join(import.meta.dirname, '../../')

beforeEach(async () => {
  await db.execute(dsql`SET client_min_messages = WARNING`)
  await db.execute(dsql`DROP SCHEMA IF EXISTS drizzle CASCADE`)
  await db.execute(dsql`DROP SCHEMA IF EXISTS public CASCADE`)
  await db.execute(dsql`CREATE SCHEMA public`)
  await migrate(db, { migrationsFolder: join(migrationsRoot, 'drizzle-supabase') })
  await migrate(db, { migrationsFolder: join(migrationsRoot, 'src/modules/customer/migrations') })
  await db.execute(dsql`SET client_min_messages = NOTICE`)
})

afterAll(async () => {
  await sql.end()
})
