import { z } from 'zod'
import { StoreCart, StoreCartLineItem, StoreCartShippingMethod, StoreConfirmInventoryItem } from './entities.js'

export const StoreCartResponse = z.object({ cart: StoreCart }).openapi('StoreCartResponse')
export type StoreCartResponse = z.infer<typeof StoreCartResponse>

export const StoreCreateCartResponse = z.object({ cart: StoreCart }).openapi('StoreCreateCartResponse')
export type StoreCreateCartResponse = z.infer<typeof StoreCreateCartResponse>

export const StoreUpdateCartResponse = z.object({ cart: StoreCart }).openapi('StoreUpdateCartResponse')
export type StoreUpdateCartResponse = z.infer<typeof StoreUpdateCartResponse>

export const StoreCartDetailResponse = z
  .object({
    cart: StoreCart.extend({
      items: z.array(StoreCartLineItem),
      shippingMethods: z.array(StoreCartShippingMethod),
    }),
  })
  .openapi('StoreCartDetailResponse')
export type StoreCartDetailResponse = z.infer<typeof StoreCartDetailResponse>

export const StoreCartLineItemResponse = z.object({ lineItem: StoreCartLineItem }).openapi('StoreCartLineItemResponse')
export type StoreCartLineItemResponse = z.infer<typeof StoreCartLineItemResponse>

export const StoreCreateCartLineItemResponse = z
  .object({ lineItem: StoreCartLineItem })
  .openapi('StoreCreateCartLineItemResponse')
export type StoreCreateCartLineItemResponse = z.infer<typeof StoreCreateCartLineItemResponse>

export const StoreUpdateCartLineItemResponse = z
  .object({ lineItem: StoreCartLineItem })
  .openapi('StoreUpdateCartLineItemResponse')
export type StoreUpdateCartLineItemResponse = z.infer<typeof StoreUpdateCartLineItemResponse>

export const StoreCreateCartShippingMethodResponse = z
  .object({ shippingMethod: StoreCartShippingMethod })
  .openapi('StoreCreateCartShippingMethodResponse')
export type StoreCreateCartShippingMethodResponse = z.infer<typeof StoreCreateCartShippingMethodResponse>

export const StoreCartInventoryResponse = z
  .object({
    cartId: z.string(),
    items: z.array(StoreConfirmInventoryItem),
  })
  .openapi('StoreCartInventoryResponse')
export type StoreCartInventoryResponse = z.infer<typeof StoreCartInventoryResponse>
