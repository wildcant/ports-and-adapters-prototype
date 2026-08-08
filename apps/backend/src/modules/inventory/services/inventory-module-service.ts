import type {
  Context,
  CreateInventoryItemDTO,
  CreateInventoryLevelDTO,
  FilterableInventoryItemProps,
  FilterableInventoryLevelProps,
  FindConfig,
  IInventoryModuleService,
  InventoryItemDTO,
  InventoryLevelDTO,
  UpdateInventoryItemDTO,
} from '../../../core/types/index.js'
import type { Logger } from '../../../core/types/logger.js'
import type { WithTransaction } from '../../../core/utils/with-transaction.js'
import type { InventoryItemRepository } from '../repositories/inventory-item.js'
import type { InventoryLevelRepository } from '../repositories/inventory-level.js'

type InjectedDependencies = {
  inventoryItemRepository: InventoryItemRepository
  inventoryLevelRepository: InventoryLevelRepository
  withTransaction: WithTransaction
  logger: Logger
}

export class InventoryModuleService implements IInventoryModuleService {
  private inventoryItemRepository: InventoryItemRepository
  private inventoryLevelRepository: InventoryLevelRepository
  private withTransaction: WithTransaction
  private logger: Logger

  constructor({ inventoryItemRepository, inventoryLevelRepository, withTransaction, logger }: InjectedDependencies) {
    this.inventoryItemRepository = inventoryItemRepository
    this.inventoryLevelRepository = inventoryLevelRepository
    this.withTransaction = withTransaction
    this.logger = logger
  }

  async listInventoryItems(
    filters?: FilterableInventoryItemProps,
    config?: FindConfig<InventoryItemDTO>,
    context?: Context,
  ): Promise<InventoryItemDTO[]> {
    return this.inventoryItemRepository.find(filters, config, context)
  }

  async retrieveInventoryItem(
    itemId: string,
    config?: FindConfig<InventoryItemDTO>,
    context?: Context,
  ): Promise<InventoryItemDTO> {
    return this.inventoryItemRepository.findByIdOrFail(itemId, config, context)
  }

  async createInventoryItems(data: CreateInventoryItemDTO[], context?: Context): Promise<InventoryItemDTO[]> {
    this.logger.debug(`Creating ${data.length} inventory item(s)`)
    return this.withTransaction(context, async (ctx) => {
      return this.inventoryItemRepository.createMany(data, ctx)
    })
  }

  async updateInventoryItems(
    itemIds: string[],
    data: UpdateInventoryItemDTO,
    context?: Context,
  ): Promise<InventoryItemDTO[]> {
    return this.withTransaction(context, async (ctx) => {
      return this.inventoryItemRepository.updateMany(itemIds, data, ctx)
    })
  }

  async createInventoryItem(data: CreateInventoryItemDTO, context?: Context): Promise<InventoryItemDTO> {
    return this.withTransaction(context, async (ctx) => {
      return this.inventoryItemRepository.create(data, ctx)
    })
  }

  async updateInventoryItem(
    itemId: string,
    data: UpdateInventoryItemDTO,
    context?: Context,
  ): Promise<InventoryItemDTO> {
    return this.withTransaction(context, async (ctx) => {
      return this.inventoryItemRepository.update(itemId, data, ctx)
    })
  }

  async createInventoryLevel(data: CreateInventoryLevelDTO, context?: Context): Promise<InventoryLevelDTO> {
    return this.withTransaction(context, async (ctx) => {
      return this.inventoryLevelRepository.create(data, ctx)
    })
  }

  async deleteInventoryItems(itemIds: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.inventoryItemRepository.softDelete(itemIds, ctx)
    })
  }

  async listInventoryLevels(
    filters?: FilterableInventoryLevelProps,
    config?: FindConfig<InventoryLevelDTO>,
    context?: Context,
  ): Promise<InventoryLevelDTO[]> {
    return this.inventoryLevelRepository.find(filters, config, context)
  }

  async createInventoryLevels(data: CreateInventoryLevelDTO[], context?: Context): Promise<InventoryLevelDTO[]> {
    this.logger.debug(`Creating ${data.length} inventory level(s)`)
    return this.withTransaction(context, async (ctx) => {
      return this.inventoryLevelRepository.createMany(data, ctx)
    })
  }

  async confirmInventory(
    inventoryItemId: string,
    locationIds: string[],
    quantity: number,
    context?: Context,
  ): Promise<boolean> {
    const levels = await this.inventoryLevelRepository.find(
      { inventoryItemId, locationId: locationIds },
      undefined,
      context,
    )

    const availableQuantity = levels.reduce((sum, level) => sum + level.stockedQuantity - level.reservedQuantity, 0)

    return availableQuantity >= quantity
  }
}
