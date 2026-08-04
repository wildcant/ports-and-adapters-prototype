import { z } from 'zod'
import { timestamps } from '../../common.js'

export const StoreShippingOption = z
  .object({
    id: z.string(),
    name: z.string(),
    priceType: z.enum(['flat', 'calculated']),
    amount: z.number().nullable(),
    serviceZoneId: z.string(),
    shippingProfileId: z.string(),
    shippingOptionTypeId: z.string().nullable(),
    providerId: z.string(),
    data: z.unknown(),
    metadata: z.string().nullable(),
    isEnabled: z.boolean(),
    ...timestamps.shape,
  })
  .openapi('StoreShippingOption')
export type StoreShippingOption = z.input<typeof StoreShippingOption>
