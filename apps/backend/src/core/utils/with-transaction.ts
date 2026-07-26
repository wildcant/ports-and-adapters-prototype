import type { Database } from '../../schema.type.js'
import { dbErrorMapper } from '../errors/db-error-mapper.js'
import type { Context } from '../types/context.js'

export type WithTransaction = <T>(context: Context | undefined, fn: (context: Context) => Promise<T>) => Promise<T>

export function createWithTransaction(getDb: () => Database): WithTransaction {
  return async <T>(context: Context | undefined, fn: (context: Context) => Promise<T>): Promise<T> => {
    if (context?.transaction) {
      return fn(context)
    }
    return getDb()
      .transaction(async (tx) => {
        return fn({ ...context, transaction: tx })
      })
      .catch(dbErrorMapper)
  }
}
