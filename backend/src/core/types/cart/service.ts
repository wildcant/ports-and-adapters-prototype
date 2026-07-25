import type { FindConfig } from '../common.js'
import type { Context } from '../context.js'
import type { CartDTO, CartLineItemDTO, FilterableCartLineItemProps, FilterableCartProps } from './common.js'
import type { CreateCartDTO, UpdateCartDTO } from './mutations.js'

export type ICartModuleService = {
  retrieveCart(cartId: string, config?: FindConfig<CartDTO>, context?: Context): Promise<CartDTO>
  listCarts(filters?: FilterableCartProps, config?: FindConfig<CartDTO>, context?: Context): Promise<CartDTO[]>
  listAndCountCarts(
    filters?: FilterableCartProps,
    config?: FindConfig<CartDTO>,
    context?: Context,
  ): Promise<[CartDTO[], number]>
  createCarts(data: CreateCartDTO[], context?: Context): Promise<CartDTO[]>
  updateCarts(cartIds: string[], data: UpdateCartDTO, context?: Context): Promise<CartDTO[]>
  deleteCarts(cartIds: string[], context?: Context): Promise<void>
  softDeleteCarts(cartIds: string[], context?: Context): Promise<void>
  restoreCarts(cartIds: string[], context?: Context): Promise<void>
  completeCart(cartId: string, context?: Context): Promise<CartDTO>
  listLineItems(
    filters?: FilterableCartLineItemProps,
    config?: FindConfig<CartLineItemDTO>,
    context?: Context,
  ): Promise<CartLineItemDTO[]>
}
