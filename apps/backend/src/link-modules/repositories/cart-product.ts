import { eq, isNull } from 'drizzle-orm'
import type { Context } from '../../core/types/context.js'
import { ReadonlyLinkRepository } from '../../core/utils/readonly-link-repository.js'
import type * as schema from '../definitions/index.js'
import { cartLineItemTable } from '../definitions/index.js'

type CartProductSchema = Pick<typeof schema, 'cartLineItemTable' | 'cartLineItemProductRelations'>
type CartProductTable = typeof cartLineItemTable

export class CartProductRepository extends ReadonlyLinkRepository<CartProductSchema, CartProductTable>(
  cartLineItemTable,
) {
  async findLineItemsWithProducts(cartId: string, context?: Context) {
    const client = this.getClient(context)
    return client.query.cartLineItemTable.findMany({
      where: (t, { and }) => and(eq(t.cartId, cartId), isNull(t.deletedAt)),
      columns: {
        id: true,
        quantity: true,
        unitPrice: true,
        variantId: true,
        productId: true,
      },
      with: {
        variant: {
          columns: { id: true, title: true, sku: true },
        },
        product: {
          columns: { id: true, title: true, handle: true, status: true },
        },
      },
    })
  }

  async findProductsByVariantIds(variantIds: string[], context?: Context) {
    if (variantIds.length === 0) return []
    const client = this.getClient(context)
    return client.query.cartLineItemTable.findMany({
      where: (t, { and, inArray }) => and(inArray(t.variantId, variantIds), isNull(t.deletedAt)),
      columns: { variantId: true, productId: true },
      with: {
        variant: {
          columns: { id: true, title: true, sku: true },
        },
        product: {
          columns: { id: true, title: true, handle: true, status: true },
        },
      },
    })
  }
}
