import type { ICartProductRepository, IProductVariantInventoryItemRepository } from './common.js'

export type ILinkRepositoryMap = {
  productVariantInventoryItem: IProductVariantInventoryItemRepository
  cartProduct: ICartProductRepository
}

export type ILinkService = {
  repo<K extends keyof ILinkRepositoryMap>(name: K): ILinkRepositoryMap[K]
}
