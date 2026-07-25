import type { FindConfig } from '../common.js'
import type { Context } from '../context.js'
import type { FilterableInventoryItemProps, FilterableInventoryLevelProps, InventoryItemDTO, InventoryLevelDTO } from './common.js'
import type { CreateInventoryItemDTO, CreateInventoryLevelDTO, UpdateInventoryItemDTO } from './mutations.js'

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
  listInventoryLevels(
    filters?: FilterableInventoryLevelProps,
    config?: FindConfig<InventoryLevelDTO>,
    context?: Context,
  ): Promise<InventoryLevelDTO[]>
  createInventoryLevels(data: CreateInventoryLevelDTO[], context?: Context): Promise<InventoryLevelDTO[]>
}
