import { z } from 'zod'
import { StoreShippingOption } from './entities.js'

export const StoreShippingOptionListResponse = z
  .object({ shippingOptions: z.array(StoreShippingOption) })
  .openapi('StoreShippingOptionListResponse')
export type StoreShippingOptionListResponse = z.infer<typeof StoreShippingOptionListResponse>
