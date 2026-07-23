import type { FindConfig } from '../common.js'
import type { Context } from '../context.js'
import type { FilterableInventoryItemProps, InventoryItemDTO } from './common.js'
import type { CreateInventoryItemDTO, UpdateInventoryItemDTO } from './mutations.js'

export type IInventoryModuleService = {
  listInventoryItems(
    filters?: FilterableInventoryItemProps,
    config?: FindConfig<InventoryItemDTO>,
    context?: Context,
  ): Promise<InventoryItemDTO[]>
  retrieveInventoryItem(
    itemId: string,
    config?: FindConfig<InventoryItemDTO>,
    context?: Context,
  ): Promise<InventoryItemDTO>
  createInventoryItems(data: CreateInventoryItemDTO[], context?: Context): Promise<InventoryItemDTO[]>
  updateInventoryItems(itemIds: string[], data: UpdateInventoryItemDTO, context?: Context): Promise<InventoryItemDTO[]>
  deleteInventoryItems(itemIds: string[], context?: Context): Promise<void>
}
