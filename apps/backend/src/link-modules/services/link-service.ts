import type { CartProductRepository } from '../repositories/cart-product.js'
import type { ProductVariantInventoryItemRepository } from '../repositories/product-variant-inventory-item.js'

export type LinkRepositoryMap = {
  productVariantInventoryItem: ProductVariantInventoryItemRepository
  cartProduct: CartProductRepository
}

type InjectedDependencies = {
  [K in keyof LinkRepositoryMap]: LinkRepositoryMap[K]
}

export class LinkService {
  private repositories: LinkRepositoryMap

  constructor(deps: InjectedDependencies) {
    this.repositories = {
      productVariantInventoryItem: deps.productVariantInventoryItem,
      cartProduct: deps.cartProduct,
    }
  }

  repo<K extends keyof LinkRepositoryMap>(name: K): LinkRepositoryMap[K] {
    return this.repositories[name]
  }
}
