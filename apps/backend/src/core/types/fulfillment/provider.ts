export type FulfillmentOption = {
  id: string
  isReturn?: boolean
}

export type CalculateShippingPriceContext = {
  cartId?: string
  shippingAddress?: Record<string, unknown>
  data?: Record<string, unknown>
}

export type CreateProviderFulfillmentInput = {
  data?: Record<string, unknown>
  items: { title: string; quantity: number; sku?: string | null; barcode?: string | null }[]
  fulfillment?: Record<string, unknown>
}

export type IFulfillmentProvider = {
  getIdentifier(): string
  getFulfillmentOptions(): Promise<FulfillmentOption[]>
  validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>,
  ): Promise<Record<string, unknown>>
  validateOption(data: Record<string, unknown>): Promise<boolean>
  canCalculate(data: Record<string, unknown>): Promise<boolean>
  calculatePrice(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: CalculateShippingPriceContext,
  ): Promise<{ amount: number }>
  createFulfillment(input: CreateProviderFulfillmentInput): Promise<{ data: Record<string, unknown> }>
  cancelFulfillment(fulfillment: Record<string, unknown>): Promise<void>
}
