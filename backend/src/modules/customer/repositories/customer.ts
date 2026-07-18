import type { SharedContext } from '@core/types/shared-context.js'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { BaseRepository } from '../../../core/utils/base-repository.js'
import { customerTable } from '../models/customer.js'

type InjectedDependencies = {
  db: PostgresJsDatabase
}

export class CustomerRepository extends BaseRepository<typeof customerTable> {
  constructor({ db }: InjectedDependencies) {
    super(db, customerTable)
  }

  async findCustomCustomer(context: SharedContext = {}) {
    const client = this.getClient(context)
    client.select().from(customerTable).where(eq(customerTable.status, 'active'))
  }
}
