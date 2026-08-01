import { z } from 'zod'

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
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('StoreShippingOption')
export type StoreShippingOption = z.infer<typeof StoreShippingOption>
