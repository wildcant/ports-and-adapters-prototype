import type {
  ICartPaymentCollectionRepository,
  ICartProductRepository,
  IProductVariantInventoryItemRepository,
} from './common.js'

export type ILinkRepositoryMap = {
  productVariantInventoryItem: IProductVariantInventoryItemRepository
  cartProduct: ICartProductRepository
  cartPaymentCollection: ICartPaymentCollectionRepository
}

export type ILinkService = {
  repo<K extends keyof ILinkRepositoryMap>(name: K): ILinkRepositoryMap[K]
}
