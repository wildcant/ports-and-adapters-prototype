import { and, eq, inArray, isNull } from 'drizzle-orm'
import type { Context } from '../../../core/types/context.js'
import { BaseRepository } from '../../../core/utils/base-repository.js'
import { shippingOptionTable } from '../models/shipping-option.js'

export class ShippingOptionRepository extends BaseRepository(shippingOptionTable) {
  async findByServiceZoneIds(serviceZoneIds: string[], context?: Context) {
    if (serviceZoneIds.length === 0) return []
    const client = this.getClient(context)
    const rows = await client
      .select()
      .from(this.table)
      .where(
        and(
          inArray(this.table.serviceZoneId, serviceZoneIds),
          eq(this.table.isEnabled, true),
          isNull(this.table.deletedAt),
        ),
      )
    return rows
  }
}
