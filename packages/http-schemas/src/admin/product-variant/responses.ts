import { z } from 'zod'
import { PaginatedResponse } from '../../common.js'
import { AdminProductVariant } from './entities.js'

export const AdminProductVariantResponse = z
  .object({ variant: AdminProductVariant })
  .openapi('AdminProductVariantResponse')
export type AdminProductVariantResponse = z.infer<typeof AdminProductVariantResponse>

export const AdminCreateProductVariantResponse = z
  .object({ variant: AdminProductVariant })
  .openapi('AdminCreateProductVariantResponse')
export type AdminCreateProductVariantResponse = z.infer<typeof AdminCreateProductVariantResponse>

export const AdminUpdateProductVariantResponse = z
  .object({ variant: AdminProductVariant })
  .openapi('AdminUpdateProductVariantResponse')
export type AdminUpdateProductVariantResponse = z.infer<typeof AdminUpdateProductVariantResponse>

export const AdminProductVariantListResponse = PaginatedResponse.extend({
  variants: z.array(AdminProductVariant),
}).openapi('AdminProductVariantListResponse')
export type AdminProductVariantListResponse = z.infer<typeof AdminProductVariantListResponse>
