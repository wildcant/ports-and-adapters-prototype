import type { PgTable } from 'drizzle-orm/pg-core'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { Context } from '../types/context.js'

export function ReadonlyLinkRepository<TSchema extends Record<string, unknown>, TTable extends PgTable>(table: TTable) {
  type Db = PostgresJsDatabase<TSchema>

  class Repository {
    #db: Db
    protected readonly table: TTable = table

    constructor({ db }: { db: Db }) {
      this.#db = db
    }

    protected getClient(context?: Context): Db {
      return (context?.transaction as Db) ?? this.#db
    }
  }

  return Repository
}
