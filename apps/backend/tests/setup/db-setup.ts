import { join } from 'node:path'
import { sql as dsql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { afterAll, beforeEach } from 'vitest'
import { DRIZZLE_OPTIONS } from '../../src/core/db/config.js'
import { env } from '../../src/env.js'

const sql = postgres(env.DATABASE_URL, { prepare: false })
export const db = drizzle(sql, DRIZZLE_OPTIONS)

const migrationsRoot = join(import.meta.dirname, '../../')

beforeEach(async () => {
  await db.execute(dsql`SET client_min_messages = WARNING`)
  await db.execute(dsql`DROP SCHEMA IF EXISTS drizzle CASCADE`)
  await db.execute(dsql`DROP SCHEMA IF EXISTS public CASCADE`)
  await db.execute(dsql`CREATE SCHEMA public`)
  await migrate(db, {
    migrationsFolder: join(migrationsRoot, 'src/modules/user/migrations'),
    migrationsTable: 'migrations_user',
  })
  await migrate(db, {
    migrationsFolder: join(migrationsRoot, 'src/modules/customer/migrations'),
    migrationsTable: 'migrations_customer',
  })
  await migrate(db, {
    migrationsFolder: join(migrationsRoot, 'src/modules/payment/migrations'),
    migrationsTable: 'migrations_payment',
  })
  await migrate(db, {
    migrationsFolder: join(migrationsRoot, 'src/modules/product/migrations'),
    migrationsTable: 'migrations_product',
  })
  await db.execute(dsql`SET client_min_messages = NOTICE`)
})

afterAll(async () => {
  await sql.end()
})
