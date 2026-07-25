import type { CartPaymentCollectionRepository } from '../repositories/cart-payment-collection.js'
import type { CartProductRepository } from '../repositories/cart-product.js'
import type { ProductVariantInventoryItemRepository } from '../repositories/product-variant-inventory-item.js'

export type LinkRepositoryMap = {
  productVariantInventoryItem: ProductVariantInventoryItemRepository
  cartProduct: CartProductRepository
  cartPaymentCollection: CartPaymentCollectionRepository
}

type InjectedDependencies = {
  [K in keyof LinkRepositoryMap]: LinkRepositoryMap[K]
}

export class LinkService {
  private repositories: LinkRepositoryMap

  constructor({ productVariantInventoryItem, cartProduct, cartPaymentCollection }: InjectedDependencies) {
    this.repositories = {
      productVariantInventoryItem,
      cartProduct,
      cartPaymentCollection,
    }
  }

  repo<K extends keyof LinkRepositoryMap>(name: K): LinkRepositoryMap[K] {
    return this.repositories[name]
  }
}
