import type { Context } from '@core/types/context.js'
import { count, isNull } from 'drizzle-orm'
import { BaseRepository } from '../../../core/utils/base-repository.js'
import { customerTable } from '../models/customer.js'

export class CustomerRepository extends BaseRepository(customerTable) {
  // Example: custom query not covered by the base repository's generic interface
  async countByStatus(context: Context) {
    return this.getClient(context)
      .select({ status: this.table.status, count: count() })
      .from(this.table)
      .where(isNull(this.table.deleted_at))
      .groupBy(this.table.status)
  }
}
