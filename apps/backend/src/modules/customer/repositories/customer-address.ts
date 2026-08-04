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
      .set({ deletedAt: new Date() })
      .where(and(inArray(this.table.customerId, customerIds), isNull(this.table.deletedAt)))
  }

  async restoreByCustomerIds(customerIds: string[], context?: Context): Promise<void> {
    if (customerIds.length === 0) return
    const client = this.getClient(context)
    await client.update(this.table).set({ deletedAt: null }).where(inArray(this.table.customerId, customerIds))
  }
}
