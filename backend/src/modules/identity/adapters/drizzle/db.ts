/**
 * DB ADAPTER -- Creates the SQLite database via Drizzle and runs migrations.
 */

import Database from "better-sqlite3"
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { join } from "path"

export const createDb = (): BetterSQLite3Database => {
  const dbPath = join(import.meta.dirname, "../../../../../dev.db")
  const sqlite = new Database(dbPath)
  const db = drizzle(sqlite)

  migrate(db, {
    migrationsFolder: join(import.meta.dirname, "../../../../../drizzle"),
  })

  return db
}
