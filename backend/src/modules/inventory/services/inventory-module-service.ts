import type {
  Context,
  CreateInventoryItemDTO,
  FilterableInventoryItemProps,
  FindConfig,
  IInventoryModuleService,
  InventoryItemDTO,
  UpdateInventoryItemDTO,
} from '../../../core/types/index.js'
import type { Logger } from '../../../core/types/logger.js'
import type { WithTransaction } from '../../../core/utils/with-transaction.js'
import type { InventoryItemRepository } from '../repositories/inventory-item.js'

type InjectedDependencies = {
  inventoryItemRepository: InventoryItemRepository
  withTransaction: WithTransaction
  logger: Logger
}

export class InventoryModuleService implements IInventoryModuleService {
  private inventoryItemRepository: InventoryItemRepository
  private withTransaction: WithTransaction
  private logger: Logger

  constructor({ inventoryItemRepository, withTransaction, logger }: InjectedDependencies) {
    this.inventoryItemRepository = inventoryItemRepository
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
      return this.inventoryItemRepository.update(itemIds, data, ctx)
    })
  }

  async deleteInventoryItems(itemIds: string[], context?: Context): Promise<void> {
    return this.withTransaction(context, async (ctx) => {
      await this.inventoryItemRepository.softDelete(itemIds, ctx)
    })
  }
}
