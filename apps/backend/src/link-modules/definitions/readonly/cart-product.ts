import { relations } from 'drizzle-orm'
import { cartLineItemTable, productTable, productVariantTable } from '../../definitions/index.js'

export const cartLineItemProductRelations = relations(cartLineItemTable, ({ one }) => ({
  product: one(productTable, {
    fields: [cartLineItemTable.productId],
    references: [productTable.id],
  }),
  variant: one(productVariantTable, {
    fields: [cartLineItemTable.variantId],
    references: [productVariantTable.id],
  }),
}))
