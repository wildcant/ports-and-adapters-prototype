export type CreateCartDTO = {
  regionId?: string | null
  customerId?: string | null
  salesChannelId?: string | null
  email?: string | null
  currencyCode: string
  shippingAddressId?: string | null
  billingAddressId?: string | null
  metadata?: string | null
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
