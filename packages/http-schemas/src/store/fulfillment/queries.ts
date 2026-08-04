import { z } from 'zod'

export const StoreShippingOptionListParams = z.object({
  countryCode: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
})

export type StoreShippingOptionListQuery = z.infer<typeof StoreShippingOptionListParams>
