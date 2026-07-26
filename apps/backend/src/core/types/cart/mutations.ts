export type CreateLineItemDTO = {
  title: string
  subtitle?: string | null | undefined
  thumbnail?: string | null | undefined
  quantity: number
  variantId?: string | null | undefined
  productId?: string | null | undefined
  productTitle?: string | null | undefined
  productDescription?: string | null | undefined
  productSubtitle?: string | null | undefined
  productType?: string | null | undefined
  productHandle?: string | null | undefined
  variantSku?: string | null | undefined
  variantBarcode?: string | null | undefined
  variantTitle?: string | null | undefined
  variantOptionValues?: string | null | undefined
  requiresShipping?: boolean | undefined
  isDiscountable?: boolean | undefined
  isGiftcard?: boolean | undefined
  isTaxInclusive?: boolean | undefined
  compareAtUnitPrice?: number | null | undefined
  unitPrice: number
  metadata?: string | null | undefined
}

export type UpdateLineItemDTO = {
  quantity?: number | undefined
  unitPrice?: number | undefined
  metadata?: string | null | undefined
}

export type CreateCartDTO = {
  regionId?: string | null | undefined
  customerId?: string | null | undefined
  salesChannelId?: string | null | undefined
  email?: string | null | undefined
  currencyCode: string
  shippingAddressId?: string | null | undefined
  billingAddressId?: string | null | undefined
  metadata?: string | null | undefined
  items?: CreateLineItemDTO[] | undefined
}

export type UpdateCartDTO = {
  regionId?: string | null | undefined
  customerId?: string | null | undefined
  salesChannelId?: string | null | undefined
  email?: string | null | undefined
  currencyCode?: string | undefined
  status?: 'active' | 'completed' | 'abandoned' | undefined
  shippingAddressId?: string | null | undefined
  billingAddressId?: string | null | undefined
  metadata?: string | null | undefined
  completedAt?: Date | null | undefined
}
