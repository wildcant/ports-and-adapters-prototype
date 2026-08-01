import { timestamp } from 'drizzle-orm/pg-core'

export const timestamps = {
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp({ mode: 'string' }),
}
