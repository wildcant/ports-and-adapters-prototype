/**
 * DRIVEN ADAPTER -- Drizzle + Supabase Postgres implementation of UserRepository.
 * This is the only file that knows about Drizzle and Postgres.
 * Swap this file to switch ORMs without touching the service or ports.
 */

import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { UserRepository } from '../../ports.js'
import { usersTable } from './schema.js'

type Dependencies = {
  db: PostgresJsDatabase
}

export const createSupabaseUserRepository = ({ db }: Dependencies): UserRepository => {
  return {
    find: async () => {
      return db.select().from(usersTable)
    },

    findById: async (id) => {
      const rows = await db.select().from(usersTable).where(eq(usersTable.id, id))
      return rows[0] ?? null
    },

    create: async (data) => {
      const user = {
        id: randomUUID(),
        email: data.email,
        name: data.name,
        created_at: new Date().toISOString(),
      }
      await db.insert(usersTable).values(user)
      return user
    },

    update: async (id, data) => {
      const existing = await db.select().from(usersTable).where(eq(usersTable.id, id))
      if (!existing[0]) return null

      await db.update(usersTable).set(data).where(eq(usersTable.id, id))

      const updated = await db.select().from(usersTable).where(eq(usersTable.id, id))
      return updated[0] ?? null
    },

    delete: async (id) => {
      const existing = await db.select().from(usersTable).where(eq(usersTable.id, id))
      if (!existing[0]) return false

      await db.delete(usersTable).where(eq(usersTable.id, id))
      return true
    },
  }
}
