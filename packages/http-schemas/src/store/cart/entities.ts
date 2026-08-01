import { z } from 'zod'

export const StoreCart = z
  .object({
    id: z.string(),
    regionId: z.string().nullable(),
    customerId: z.string().nullable(),
    salesChannelId: z.string().nullable(),
    email: z.string().nullable(),
    currencyCode: z.string(),
    status: z.string(),
    shippingAddressId: z.string().nullable(),
    billingAddressId: z.string().nullable(),
    metadata: z.string().nullable(),
    completedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('StoreCart')
export type StoreCart = z.infer<typeof StoreCart>

export const StoreCartLineItem = z
  .object({
    id: z.string(),
    cartId: z.string(),
    title: z.string(),
    subtitle: z.string().nullable(),
    thumbnail: z.string().nullable(),
    quantity: z.number(),
    variantId: z.string().nullable(),
    productId: z.string().nullable(),
    productTitle: z.string().nullable(),
    productDescription: z.string().nullable(),
    productSubtitle: z.string().nullable(),
    productType: z.string().nullable(),
    productHandle: z.string().nullable(),
    variantSku: z.string().nullable(),
    variantBarcode: z.string().nullable(),
    variantTitle: z.string().nullable(),
    variantOptionValues: z.string().nullable(),
    requiresShipping: z.boolean(),
    isDiscountable: z.boolean(),
    isGiftcard: z.boolean(),
    isTaxInclusive: z.boolean(),
    compareAtUnitPrice: z.number().nullable(),
    unitPrice: z.number(),
    metadata: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('StoreCartLineItem')
export type StoreCartLineItem = z.infer<typeof StoreCartLineItem>

export const StoreCartShippingMethod = z
  .object({
    id: z.string(),
    cartId: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    amount: z.number(),
    isTaxInclusive: z.boolean(),
    shippingOptionId: z.string().nullable(),
    data: z.string().nullable(),
    metadata: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .openapi('StoreCartShippingMethod')
export type StoreCartShippingMethod = z.infer<typeof StoreCartShippingMethod>

export const StoreConfirmInventoryItem = z
  .object({
    lineItemId: z.string(),
    variantId: z.string(),
    inventoryItemId: z.string(),
    requiredQuantity: z.number(),
    quantity: z.number(),
    locationIds: z.array(z.string()),
  })
  .openapi('StoreConfirmInventoryItem')
export type StoreConfirmInventoryItem = z.infer<typeof StoreConfirmInventoryItem>
