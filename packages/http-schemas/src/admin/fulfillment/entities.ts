import { z } from 'zod'

export const AdminFulfillmentProvider = z
  .object({
    id: z.string(),
    isEnabled: z.boolean(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('AdminFulfillmentProvider')
export type AdminFulfillmentProvider = z.infer<typeof AdminFulfillmentProvider>

export const AdminFulfillmentSet = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    metadata: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('AdminFulfillmentSet')
export type AdminFulfillmentSet = z.infer<typeof AdminFulfillmentSet>

export const AdminServiceZone = z
  .object({
    id: z.string(),
    name: z.string(),
    fulfillmentSetId: z.string(),
    metadata: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('AdminServiceZone')
export type AdminServiceZone = z.infer<typeof AdminServiceZone>

export const AdminGeoZone = z
  .object({
    id: z.string(),
    type: z.enum(['country', 'province', 'city', 'zip']),
    countryCode: z.string(),
    provinceCode: z.string().nullable(),
    city: z.string().nullable(),
    postalExpression: z.string().nullable(),
    serviceZoneId: z.string(),
    metadata: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('AdminGeoZone')
export type AdminGeoZone = z.infer<typeof AdminGeoZone>

export const AdminShippingProfile = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    metadata: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('AdminShippingProfile')
export type AdminShippingProfile = z.infer<typeof AdminShippingProfile>

export const AdminShippingOption = z
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
  .openapi('AdminShippingOption')
export type AdminShippingOption = z.infer<typeof AdminShippingOption>
