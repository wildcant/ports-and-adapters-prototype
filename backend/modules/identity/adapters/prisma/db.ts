/**
 * DB ADAPTER -- Creates a PrismaClient connected to SQLite.
 */

import { join } from "path"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../../../../generated/prisma/client.js"

export const createPrismaClient = (): PrismaClient => {
  const dbPath = join(import.meta.dirname, "../../../../dev.db")
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  return new PrismaClient({ adapter })
}
