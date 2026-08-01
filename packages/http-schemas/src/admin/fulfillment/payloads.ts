import { z } from 'zod'

export const AdminCreateFulfillmentSet = z
  .object({
    name: z.string().min(1),
    type: z.string().min(1),
  })
  .openapi('AdminCreateFulfillmentSet')
export type AdminCreateFulfillmentSetBody = z.infer<typeof AdminCreateFulfillmentSet>

export const AdminUpdateFulfillmentSet = z
  .object({
    name: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
  })
  .openapi('AdminUpdateFulfillmentSet')
export type AdminUpdateFulfillmentSetBody = z.infer<typeof AdminUpdateFulfillmentSet>

export const AdminCreateGeoZoneInput = z.object({
  type: z.enum(['country', 'province', 'city', 'zip']),
  countryCode: z.string().length(2),
  provinceCode: z.string().optional(),
  city: z.string().optional(),
  postalExpression: z.string().optional(),
})

export const AdminCreateServiceZone = z
  .object({
    name: z.string().min(1),
    geoZones: z.array(AdminCreateGeoZoneInput).optional(),
  })
  .openapi('AdminCreateServiceZone')
export type AdminCreateServiceZoneBody = z.infer<typeof AdminCreateServiceZone>

export const AdminUpdateServiceZone = z
  .object({
    name: z.string().min(1).optional(),
  })
  .openapi('AdminUpdateServiceZone')
export type AdminUpdateServiceZoneBody = z.infer<typeof AdminUpdateServiceZone>

export const AdminCreateGeoZone = AdminCreateGeoZoneInput.openapi('AdminCreateGeoZone')
export type AdminCreateGeoZoneBody = z.infer<typeof AdminCreateGeoZone>

export const AdminCreateShippingProfile = z
  .object({
    name: z.string().min(1),
    type: z.string().min(1),
  })
  .openapi('AdminCreateShippingProfile')
export type AdminCreateShippingProfileBody = z.infer<typeof AdminCreateShippingProfile>

export const AdminUpdateShippingProfile = z
  .object({
    name: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
  })
  .openapi('AdminUpdateShippingProfile')
export type AdminUpdateShippingProfileBody = z.infer<typeof AdminUpdateShippingProfile>

export const AdminCreateShippingOption = z
  .object({
    name: z.string().min(1),
    priceType: z.enum(['flat', 'calculated']),
    amount: z.number().int().min(0).optional(),
    serviceZoneId: z.string().min(1),
    shippingProfileId: z.string().min(1),
    shippingOptionTypeId: z.string().optional(),
    providerId: z.string().min(1),
    data: z.record(z.string(), z.unknown()).optional(),
  })
  .openapi('AdminCreateShippingOption')
export type AdminCreateShippingOptionBody = z.infer<typeof AdminCreateShippingOption>

export const AdminUpdateShippingOption = z
  .object({
    name: z.string().min(1).optional(),
    amount: z.number().int().min(0).optional(),
    data: z.record(z.string(), z.unknown()).optional(),
    isEnabled: z.boolean().optional(),
  })
  .openapi('AdminUpdateShippingOption')
export type AdminUpdateShippingOptionBody = z.infer<typeof AdminUpdateShippingOption>

export const AdminZoneIdParams = z.object({
  id: z.string().min(1),
  zoneId: z.string().min(1),
})
export type AdminZoneIdParams = z.infer<typeof AdminZoneIdParams>
