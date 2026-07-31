import { z } from 'zod'

// Admin - FulfillmentSet

export const CreateFulfillmentSet = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
})
export type CreateFulfillmentSetBody = z.infer<typeof CreateFulfillmentSet>

export const UpdateFulfillmentSet = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
})
export type UpdateFulfillmentSetBody = z.infer<typeof UpdateFulfillmentSet>

// Admin - ServiceZone

export const CreateGeoZoneInput = z.object({
  type: z.enum(['country', 'province', 'city', 'zip']),
  countryCode: z.string().length(2),
  provinceCode: z.string().optional(),
  city: z.string().optional(),
  postalExpression: z.string().optional(),
})

export const CreateServiceZone = z.object({
  name: z.string().min(1),
  geoZones: z.array(CreateGeoZoneInput).optional(),
})
export type CreateServiceZoneBody = z.infer<typeof CreateServiceZone>

export const UpdateServiceZone = z.object({
  name: z.string().min(1).optional(),
})
export type UpdateServiceZoneBody = z.infer<typeof UpdateServiceZone>

// Admin - GeoZone

export const CreateGeoZone = CreateGeoZoneInput
export type CreateGeoZoneBody = z.infer<typeof CreateGeoZone>

// Admin - ShippingProfile

export const CreateShippingProfile = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
})
export type CreateShippingProfileBody = z.infer<typeof CreateShippingProfile>

export const UpdateShippingProfile = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
})
export type UpdateShippingProfileBody = z.infer<typeof UpdateShippingProfile>

// Admin - ShippingOption

export const CreateShippingOption = z.object({
  name: z.string().min(1),
  priceType: z.enum(['flat', 'calculated']),
  amount: z.number().int().min(0).optional(),
  serviceZoneId: z.string().min(1),
  shippingProfileId: z.string().min(1),
  shippingOptionTypeId: z.string().optional(),
  providerId: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
})
export type CreateShippingOptionBody = z.infer<typeof CreateShippingOption>

export const UpdateShippingOption = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().int().min(0).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  isEnabled: z.boolean().optional(),
})
export type UpdateShippingOptionBody = z.infer<typeof UpdateShippingOption>

// Store - Add shipping method to cart

export const AddCartShippingMethod = z.object({
  shippingOptionId: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
})
export type AddCartShippingMethodBody = z.infer<typeof AddCartShippingMethod>

// Params

export const ZoneIdParams = z.object({
  id: z.string().min(1),
  zoneId: z.string().min(1),
})
export type ZoneIdParams = z.infer<typeof ZoneIdParams>
