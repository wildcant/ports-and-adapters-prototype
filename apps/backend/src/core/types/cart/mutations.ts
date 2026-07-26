export type CreateLineItemDTO = {
  title: string
  subtitle?: string | null
  thumbnail?: string | null
  quantity: number
  variantId?: string | null
  productId?: string | null
  productTitle?: string | null
  productDescription?: string | null
  productSubtitle?: string | null
  productType?: string | null
  productHandle?: string | null
  variantSku?: string | null
  variantBarcode?: string | null
  variantTitle?: string | null
  variantOptionValues?: string | null
  requiresShipping?: boolean
  isDiscountable?: boolean
  isGiftcard?: boolean
  isTaxInclusive?: boolean
  compareAtUnitPrice?: number | null
  unitPrice: number
  metadata?: string | null
}

export type UpdateLineItemDTO = {
  quantity?: number
  unitPrice?: number
  metadata?: string | null
}

export type CreateCartDTO = {
  regionId?: string | null
  customerId?: string | null
  salesChannelId?: string | null
  email?: string | null
  currencyCode: string
  shippingAddressId?: string | null
  billingAddressId?: string | null
  metadata?: string | null
  items?: CreateLineItemDTO[]
}

export type UpdateCartDTO = {
  regionId?: string | null
  customerId?: string | null
  salesChannelId?: string | null
  email?: string | null
  currencyCode?: string
  status?: 'active' | 'completed' | 'abandoned'
  shippingAddressId?: string | null
  billingAddressId?: string | null
  metadata?: string | null
  completedAt?: Date | null
}
