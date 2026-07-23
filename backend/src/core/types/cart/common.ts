import type { BaseFilterable, OperatorMap } from '../common.js'

export type CartStatus = 'active' | 'completed' | 'abandoned'

export type CartDTO = {
  id: string
  regionId: string | null
  customerId: string | null
  salesChannelId: string | null
  email: string | null
  currencyCode: string
  status: CartStatus
  shippingAddressId: string | null
  billingAddressId: string | null
  metadata: string | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface FilterableCartProps extends BaseFilterable<FilterableCartProps> {
  id?: string | string[]
  customerId?: string | string[]
  email?: string | OperatorMap<string>
  currencyCode?: string | string[]
  status?: CartStatus | CartStatus[]
  regionId?: string | string[]
  salesChannelId?: string | string[]
  createdAt?: OperatorMap<Date>
}
