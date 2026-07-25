import { type AwilixContainer, asValue } from 'awilix'
import { drizzle } from 'drizzle-orm/postgres-js'
import type { Sql } from 'postgres'
import { ContainerRegistrationKeys } from '../core/utils/index.js'
import * as schema from './definitions/index.js'
import { CartPaymentCollectionRepository } from './repositories/cart-payment-collection.js'
import { CartProductRepository } from './repositories/cart-product.js'
import { ProductVariantInventoryItemRepository } from './repositories/product-variant-inventory-item.js'
import { LinkService } from './services/link-service.js'

export function registerLinkService(sharedContainer: AwilixContainer): void {
  const pgClient: Sql = sharedContainer.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const db = drizzle(pgClient, { schema, casing: 'snake_case' })

  const productVariantInventoryItem = new ProductVariantInventoryItemRepository({ db })
  const cartProduct = new CartProductRepository({ db })
  const cartPaymentCollection = new CartPaymentCollectionRepository({ db })

  const linkService = new LinkService({
    productVariantInventoryItem,
    cartProduct,
    cartPaymentCollection,
  })

  sharedContainer.register({
    [ContainerRegistrationKeys.LINK]: asValue(linkService),
  })
}
