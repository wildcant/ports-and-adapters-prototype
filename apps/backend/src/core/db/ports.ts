import type { Database } from '../../schema.type.js'

export interface DbProvider {
  getDb(): Database
  withConnection<T>(fn: () => Promise<T>): Promise<T>
}
