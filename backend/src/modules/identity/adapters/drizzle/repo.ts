/**
 * DRIVEN ADAPTER -- Drizzle + SQLite implementation of UserRepository.
 * This is the only file that knows about Drizzle and SQLite.
 * Swap this file to switch ORMs without touching the service or ports.
 */

import { randomUUID } from "crypto"
import { eq } from "drizzle-orm"
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import type { UserRepository } from "../../ports.js"
import { usersTable } from "./schema.js"

type Dependencies = {
  db: BetterSQLite3Database
}

export const createDrizzleUserRepository = ({
  db,
}: Dependencies): UserRepository => {
  return {
    find: async () => {
      return db.select().from(usersTable).all()
    },

    findById: async (id) => {
      const rows = db.select().from(usersTable).where(eq(usersTable.id, id)).all()
      return rows[0] ?? null
    },

    create: async (data) => {
      const user = {
        id: randomUUID(),
        email: data.email,
        name: data.name,
        created_at: new Date().toISOString(),
      }
      db.insert(usersTable).values(user).run()
      return user
    },

    update: async (id, data) => {
      const existing = db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .all()
      if (!existing[0]) return null

      db.update(usersTable).set(data).where(eq(usersTable.id, id)).run()

      const updated = db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .all()
      return updated[0] ?? null
    },

    delete: async (id) => {
      const existing = db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .all()
      if (!existing[0]) return false

      db.delete(usersTable).where(eq(usersTable.id, id)).run()
      return true
    },
  }
}
