import { z } from 'zod'
import {
  AdminFulfillmentProvider,
  AdminFulfillmentSet,
  AdminGeoZone,
  AdminServiceZone,
  AdminShippingOption,
  AdminShippingProfile,
} from './entities.js'

export const AdminFulfillmentProviderListResponse = z
  .object({
    fulfillmentProviders: z.array(AdminFulfillmentProvider),
  })
  .openapi('AdminFulfillmentProviderListResponse')
export type AdminFulfillmentProviderListResponse = z.input<typeof AdminFulfillmentProviderListResponse>

export const AdminFulfillmentSetListResponse = z
  .object({ fulfillmentSets: z.array(AdminFulfillmentSet) })
  .openapi('AdminFulfillmentSetListResponse')
export type AdminFulfillmentSetListResponse = z.input<typeof AdminFulfillmentSetListResponse>

export const AdminFulfillmentSetResponse = z
  .object({ fulfillmentSet: AdminFulfillmentSet })
  .openapi('AdminFulfillmentSetResponse')
export type AdminFulfillmentSetResponse = z.input<typeof AdminFulfillmentSetResponse>

export const AdminCreateFulfillmentSetResponse = z
  .object({ fulfillmentSet: AdminFulfillmentSet })
  .openapi('AdminCreateFulfillmentSetResponse')
export type AdminCreateFulfillmentSetResponse = z.input<typeof AdminCreateFulfillmentSetResponse>

export const AdminUpdateFulfillmentSetResponse = z
  .object({ fulfillmentSet: AdminFulfillmentSet })
  .openapi('AdminUpdateFulfillmentSetResponse')
export type AdminUpdateFulfillmentSetResponse = z.input<typeof AdminUpdateFulfillmentSetResponse>

export const AdminFulfillmentSetDetailResponse = z
  .object({ fulfillmentSet: AdminFulfillmentSet.extend({ serviceZones: z.array(AdminServiceZone) }) })
  .openapi('AdminFulfillmentSetDetailResponse')
export type AdminFulfillmentSetDetailResponse = z.input<typeof AdminFulfillmentSetDetailResponse>

export const AdminServiceZoneResponse = z.object({ serviceZone: AdminServiceZone }).openapi('AdminServiceZoneResponse')
export type AdminServiceZoneResponse = z.input<typeof AdminServiceZoneResponse>

export const AdminCreateServiceZoneResponse = z
  .object({ serviceZone: AdminServiceZone })
  .openapi('AdminCreateServiceZoneResponse')
export type AdminCreateServiceZoneResponse = z.input<typeof AdminCreateServiceZoneResponse>

export const AdminUpdateServiceZoneResponse = z
  .object({ serviceZone: AdminServiceZone })
  .openapi('AdminUpdateServiceZoneResponse')
export type AdminUpdateServiceZoneResponse = z.input<typeof AdminUpdateServiceZoneResponse>

export const AdminServiceZoneDetailResponse = z
  .object({ serviceZone: AdminServiceZone.extend({ geoZones: z.array(AdminGeoZone) }) })
  .openapi('AdminServiceZoneDetailResponse')
export type AdminServiceZoneDetailResponse = z.input<typeof AdminServiceZoneDetailResponse>

export const AdminCreateGeoZoneResponse = z.object({ geoZone: AdminGeoZone }).openapi('AdminCreateGeoZoneResponse')
export type AdminCreateGeoZoneResponse = z.input<typeof AdminCreateGeoZoneResponse>

export const AdminShippingProfileListResponse = z
  .object({ shippingProfiles: z.array(AdminShippingProfile) })
  .openapi('AdminShippingProfileListResponse')
export type AdminShippingProfileListResponse = z.input<typeof AdminShippingProfileListResponse>

export const AdminShippingProfileResponse = z
  .object({ shippingProfile: AdminShippingProfile })
  .openapi('AdminShippingProfileResponse')
export type AdminShippingProfileResponse = z.input<typeof AdminShippingProfileResponse>

export const AdminCreateShippingProfileResponse = z
  .object({ shippingProfile: AdminShippingProfile })
  .openapi('AdminCreateShippingProfileResponse')
export type AdminCreateShippingProfileResponse = z.input<typeof AdminCreateShippingProfileResponse>

export const AdminUpdateShippingProfileResponse = z
  .object({ shippingProfile: AdminShippingProfile })
  .openapi('AdminUpdateShippingProfileResponse')
export type AdminUpdateShippingProfileResponse = z.input<typeof AdminUpdateShippingProfileResponse>

export const AdminShippingOptionListResponse = z
  .object({ shippingOptions: z.array(AdminShippingOption) })
  .openapi('AdminShippingOptionListResponse')
export type AdminShippingOptionListResponse = z.input<typeof AdminShippingOptionListResponse>

export const AdminShippingOptionResponse = z
  .object({ shippingOption: AdminShippingOption })
  .openapi('AdminShippingOptionResponse')
export type AdminShippingOptionResponse = z.input<typeof AdminShippingOptionResponse>

export const AdminCreateShippingOptionResponse = z
  .object({ shippingOption: AdminShippingOption })
  .openapi('AdminCreateShippingOptionResponse')
export type AdminCreateShippingOptionResponse = z.input<typeof AdminCreateShippingOptionResponse>

export const AdminUpdateShippingOptionResponse = z
  .object({ shippingOption: AdminShippingOption })
  .openapi('AdminUpdateShippingOptionResponse')
export type AdminUpdateShippingOptionResponse = z.input<typeof AdminUpdateShippingOptionResponse>
