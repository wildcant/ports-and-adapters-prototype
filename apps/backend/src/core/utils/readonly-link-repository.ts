import type { PgTable } from 'drizzle-orm/pg-core'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { Context } from '../types/context.js'

export function ReadonlyLinkRepository<TSchema extends Record<string, unknown>, TTable extends PgTable>(table: TTable) {
  type Db = PostgresJsDatabase<TSchema>

  class Repository {
    #getDb: () => Db
    protected readonly table: TTable = table

    constructor({ getDb }: { getDb: () => Db }) {
      this.#getDb = getDb
    }

    protected getClient(context?: Context): Db {
      return (context?.transaction as Db) ?? this.#getDb()
    }
  }

  return Repository
}
