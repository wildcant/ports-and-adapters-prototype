import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { Context } from '../types/context.js'

export type WithTransaction = <T>(context: Context, fn: (context: Context) => Promise<T>) => Promise<T>

export function createWithTransaction(db: PostgresJsDatabase): WithTransaction {
  return async <T>(context: Context, fn: (context: Context) => Promise<T>): Promise<T> => {
    if (context.transaction) {
      return fn(context)
    }
    return db.transaction(async (tx) => {
      return fn({ ...context, transaction: tx })
    })
  }
}
