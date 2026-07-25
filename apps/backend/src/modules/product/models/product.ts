import { sql } from 'drizzle-orm'
import { boolean, doublePrecision, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const ProductStatus = {
  DRAFT: 'draft',
  PROPOSED: 'proposed',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
} as const

export type ProductStatusType = (typeof ProductStatus)[keyof typeof ProductStatus]

export const productTable = pgTable(
  'product',
  {
    id: text().primaryKey().default(sql`CONCAT('prod_', REPLACE(gen_random_uuid()::text, '-', ''))`),
    title: text().notNull(),
    handle: text().notNull(),
    subtitle: text(),
    description: text(),
    isGiftcard: boolean().default(false).notNull(),
    status: text().$type<ProductStatusType>().default('draft').notNull(),
    thumbnail: text(),
    weight: doublePrecision(),
    length: doublePrecision(),
    height: doublePrecision(),
    width: doublePrecision(),
    originCountry: text(),
    hsCode: text(),
    midCode: text(),
    material: text(),
    discountable: boolean().default(true).notNull(),
    externalId: text(),
    metadata: text(),
    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
  },
  (table) => [uniqueIndex('idx_product_handle').on(table.handle).where(sql`deleted_at IS NULL`)],
)

export type Product = typeof productTable.$inferSelect
export type CreateProduct = typeof productTable.$inferInsert
