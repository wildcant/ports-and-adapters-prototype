import { test } from '@tests/setup/test-extend.js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { beforeEach, describe } from 'vitest'
import { createWithTransaction } from '../../../core/utils/with-transaction.js'
import { env } from '../../../env.js'
import { CustomerRepository } from '../repositories/customer.js'
import { CustomerModuleService } from '../services/customer-module-service.js'

let service: CustomerModuleService

beforeEach(() => {
  const sql = postgres(env.SUPABASE_DATABASE_URL, { prepare: false })
  const db = drizzle(sql)
  const customerRepository = new CustomerRepository({ db })
  const withTransaction = createWithTransaction(db)
  service = new CustomerModuleService({ customerRepository, withTransaction })
})

describe('CustomerModuleService', () => {
  test('createCustomers', async ({ expect, dto }) => {
    const input = [dto.generate.createCustomer(), dto.generate.createCustomer()]

    const result = await service.createCustomers(input)

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      first_name: input[0].first_name,
      last_name: input[0].last_name,
      email: input[0].email,
    })
    expect(result[0].id).toBeDefined()
    expect(result[0].created_at).toBeInstanceOf(Date)
  })

  test('retrieveCustomer', async ({ expect, dto }) => {
    const [created] = await service.createCustomers([dto.generate.createCustomer()])

    const result = await service.retrieveCustomer(created.id)

    expect(result).toMatchObject({
      id: created.id,
      first_name: created.first_name,
      last_name: created.last_name,
      email: created.email,
    })
  })

  test('listCustomers', async ({ expect, dto }) => {
    await service.createCustomers([
      dto.generate.createCustomer(),
      dto.generate.createCustomer(),
      dto.generate.createCustomer(),
    ])

    const result = await service.listCustomers()

    expect(result).toHaveLength(3)
  })

  test('listAndCountCustomers', async ({ expect, dto }) => {
    await service.createCustomers([
      dto.generate.createCustomer(),
      dto.generate.createCustomer(),
      dto.generate.createCustomer(),
    ])

    const [rows, count] = await service.listAndCountCustomers()

    expect(rows).toHaveLength(3)
    expect(count).toBe(3)
  })

  test('updateCustomers', async ({ expect, dto }) => {
    const [created] = await service.createCustomers([dto.generate.createCustomer()])
    const update = dto.generate.updateCustomer({ first_name: 'Updated' })

    const [updated] = await service.updateCustomers([created.id], update)

    expect(updated.first_name).toBe('Updated')
    expect(updated.id).toBe(created.id)
  })

  test('deleteCustomers', async ({ expect, dto }) => {
    const [created] = await service.createCustomers([dto.generate.createCustomer()])

    await service.deleteCustomers([created.id])

    await expect(service.retrieveCustomer(created.id)).rejects.toThrow()
  })

  test('softDeleteCustomers', async ({ expect, dto }) => {
    const [created] = await service.createCustomers([dto.generate.createCustomer()])

    await service.softDeleteCustomers([created.id])

    const list = await service.listCustomers()
    expect(list).toHaveLength(0)
  })

  test('restoreCustomers', async ({ expect, dto }) => {
    const [created] = await service.createCustomers([dto.generate.createCustomer()])
    await service.softDeleteCustomers([created.id])

    await service.restoreCustomers([created.id])

    const list = await service.listCustomers()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(created.id)
  })
})
