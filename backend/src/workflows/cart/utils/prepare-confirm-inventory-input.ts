import type { CartLineItemDTO } from '@core/types/cart/common.js'
import type { InventoryLevelDTO } from '@core/types/inventory/common.js'
import type { ProductVariantInventoryItemDTO } from '@core/types/link/common.js'

export type ConfirmInventoryItem = {
  lineItemId: string
  variantId: string
  inventoryItemId: string
  requiredQuantity: number
  quantity: number
  locationIds: string[]
}

export type ConfirmInventoryResult = {
  cartId: string
  items: ConfirmInventoryItem[]
}

export function prepareConfirmInventoryInput(data: {
  cartId: string
  lineItems: CartLineItemDTO[]
  mappings: ProductVariantInventoryItemDTO[]
  levels: InventoryLevelDTO[]
}): ConfirmInventoryResult {
  const levelsByInventoryItem = new Map<string, InventoryLevelDTO[]>()
  for (const level of data.levels) {
    const existing = levelsByInventoryItem.get(level.inventoryItemId) ?? []
    existing.push(level)
    levelsByInventoryItem.set(level.inventoryItemId, existing)
  }

  const mappingsByVariant = new Map<string, ProductVariantInventoryItemDTO[]>()
  for (const mapping of data.mappings) {
    const existing = mappingsByVariant.get(mapping.variantId) ?? []
    existing.push(mapping)
    mappingsByVariant.set(mapping.variantId, existing)
  }

  const items: ConfirmInventoryItem[] = []

  for (const li of data.lineItems) {
    if (!li.variantId) {
      continue
    }

    const variantMappings = mappingsByVariant.get(li.variantId) ?? []

    for (const mapping of variantMappings) {
      const levels = levelsByInventoryItem.get(mapping.inventoryItemId) ?? []
      const locationIds = levels.map((l) => l.locationId)

      items.push({
        lineItemId: li.id,
        variantId: li.variantId,
        inventoryItemId: mapping.inventoryItemId,
        requiredQuantity: mapping.requiredQuantity,
        quantity: li.quantity,
        locationIds,
      })
    }
  }

  return { cartId: data.cartId, items }
}
