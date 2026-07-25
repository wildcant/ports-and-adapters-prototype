import type { ICartModuleService, ILinkService } from '@core/types/index.js'
import { ContainerRegistrationKeys, Modules } from '@core/utils/index.js'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type CheckInventoryInput = { params: { id: string } }

export const GET = async (req: HttpRequest<CheckInventoryInput>) => {
  const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
  const linkService = req.scope.resolve<ILinkService>(ContainerRegistrationKeys.LINK)

  // 1. Get line items for this cart
  const lineItems = await cartService.listLineItems({ cartId: req.params.id })

  // 2. Collect variant IDs (skip custom/non-variant line items)
  const variantIds = lineItems.map((li) => li.variantId).filter((id): id is string => id != null)

  // 3. Get inventory availability via the link table + inventory levels
  const availability = await linkService.repo('productVariantInventoryItem').getInventoryAvailability(variantIds)

  // 4. Compute available quantity and build per-line-item map
  const availabilityWithComputed = availability.map((row) => ({
    ...row,
    availableQuantity: row.stockedQuantity - row.reservedQuantity,
  }))

  const availabilityByVariant = new Map<string, (typeof availabilityWithComputed)[number][]>()
  for (const row of availabilityWithComputed) {
    const existing = availabilityByVariant.get(row.variantId) ?? []
    existing.push(row)
    availabilityByVariant.set(row.variantId, existing)
  }

  const items = lineItems.map((li) => {
    if (!li.variantId) {
      return { lineItemId: li.id, variantId: null, quantity: li.quantity, sufficient: true, inventory: [] }
    }

    const levels = availabilityByVariant.get(li.variantId) ?? []
    const totalAvailable = levels.reduce((sum, l) => sum + l.availableQuantity, 0)
    const requiredPerUnit = levels[0]?.requiredQuantity ?? 1
    const totalRequired = li.quantity * requiredPerUnit

    return {
      lineItemId: li.id,
      variantId: li.variantId,
      quantity: li.quantity,
      requiredPerUnit,
      totalRequired,
      totalAvailable,
      sufficient: totalAvailable >= totalRequired,
      inventory: levels.map((l) => ({
        inventoryItemId: l.inventoryItemId,
        locationId: l.locationId,
        stockedQuantity: l.stockedQuantity,
        reservedQuantity: l.reservedQuantity,
        availableQuantity: l.availableQuantity,
      })),
    }
  })

  const allSufficient = items.every((item) => item.sufficient)

  return {
    status: 200,
    json: { cartId: req.params.id, allSufficient, items },
  } satisfies HttpResult
}
