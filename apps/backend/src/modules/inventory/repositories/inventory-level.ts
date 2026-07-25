import { BaseRepository } from '../../../core/utils/base-repository.js'
import { inventoryLevelTable } from '../models/inventory-level.js'

export class InventoryLevelRepository extends BaseRepository(inventoryLevelTable) {}
