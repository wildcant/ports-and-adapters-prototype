import { and, eq, isNull } from 'drizzle-orm'
import type { Context } from '../../../core/types/context.js'
import { BaseRepository } from '../../../core/utils/base-repository.js'
import { productTable } from '../models/product.js'

export class ProductRepository extends BaseRepository(productTable) {
  async findByHandle(handle: string, context?: Context) {
    const client = this.getClient(context)
    const rows = await client
      .select()
      .from(this.table)
      .where(and(eq(this.table.handle, handle), isNull(this.table.deletedAt)))
    return rows[0] ?? null
  }
}
