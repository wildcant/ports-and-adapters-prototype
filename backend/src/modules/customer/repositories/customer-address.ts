import { and, inArray, isNull } from 'drizzle-orm'
import type { Context } from '../../../core/types/context.js'
import { BaseRepository } from '../../../core/utils/base-repository.js'
import { customerAddressTable } from '../models/customer-address.js'

export class CustomerAddressRepository extends BaseRepository(customerAddressTable) {
  async softDeleteByCustomerIds(customerIds: string[], context?: Context): Promise<void> {
    if (customerIds.length === 0) return
    const client = this.getClient(context)
    await client
      .update(this.table)
      .set({ deleted_at: new Date() })
      .where(and(inArray(this.table.customer_id, customerIds), isNull(this.table.deleted_at)))
  }

  async restoreByCustomerIds(customerIds: string[], context?: Context): Promise<void> {
    if (customerIds.length === 0) return
    const client = this.getClient(context)
    await client.update(this.table).set({ deleted_at: null }).where(inArray(this.table.customer_id, customerIds))
  }
}
