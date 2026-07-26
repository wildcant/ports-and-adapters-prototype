import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type * as schema from './schema.js'

export type DatabaseSchema = typeof schema
export type Database = PostgresJsDatabase<DatabaseSchema>
