import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { SharedContext } from '../types/shared-context.js'

export async function withTransaction<T>(
  db: PostgresJsDatabase,
  context: SharedContext,
  fn: (context: SharedContext) => Promise<T>,
): Promise<T> {
  if (context.transaction) {
    return fn(context)
  }
  return db.transaction(async (tx) => {
    return fn({ ...context, transaction: tx })
  })
}
