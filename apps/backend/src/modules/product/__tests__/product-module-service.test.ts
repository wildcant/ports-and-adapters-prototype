import { AppError, ErrorTypes } from '@core/errors/app-error.js'
import { test } from '@tests/setup/test-extend.js'
import { assertDefined } from '@tests/utils/assert-defined.js'
import { describe } from 'vitest'
import { buildSearchFilter } from '../../../core/utils/build-search-filter.js'
import { createWithTransaction } from '../../../core/utils/with-transaction.js'
import { ProductRepository } from '../repositories/product.js'
import { ProductImageRepository } from '../repositories/product-image.js'
import { ProductOptionRepository } from '../repositories/product-option.js'
import { ProductOptionValueRepository } from '../repositories/product-option-value.js'
import { ProductVariantRepository } from '../repositories/product-variant.js'
import { ProductModuleService } from '../services/product-module-service.js'

let service: ProductModuleService

test.beforeEach(({ getDb, logger }) => {
  const productRepository = new ProductRepository({ getDb })
  const productVariantRepository = new ProductVariantRepository({ getDb })
  const productOptionRepository = new ProductOptionRepository({ getDb })
  const productOptionValueRepository = new ProductOptionValueRepository({ getDb })
  const productImageRepository = new ProductImageRepository({ getDb })
  const withTransaction = createWithTransaction(getDb)
  service = new ProductModuleService({
    productRepository,
    productVariantRepository,
    productOptionRepository,
    productOptionValueRepository,
    productImageRepository,
    withTransaction,
    logger,
  })
})

describe('ProductModuleService', () => {
  test('listAndCountProducts with pagination', async ({ expect, dto }) => {
    await service.createProducts([
      dto.generate.createProduct(),
      dto.generate.createProduct(),
      dto.generate.createProduct(),
    ])

    const [rows, count] = await service.listAndCountProducts(undefined, { offset: 0, limit: 2 })

    expect(rows).toHaveLength(2)
    expect(count).toBe(3)
  })

  test('listAndCountProducts with single-word q search', async ({ expect }) => {
    await service.createProducts([{ title: 'Blue Widget' }, { title: 'Red Gadget' }, { title: 'Blue Gadget' }])

    const searchFilter = buildSearchFilter('blue', ['title', 'handle'])
    const [rows, count] = await service.listAndCountProducts(searchFilter)

    expect(count).toBe(2)
    expect(rows.map((r) => r.title).sort()).toEqual(['Blue Gadget', 'Blue Widget'])
  })

  test('listAndCountProducts with multi-word q search', async ({ expect }) => {
    await service.createProducts([{ title: 'Blue Widget' }, { title: 'Red Widget' }, { title: 'Blue Gadget' }])

    // "blue widget" should match only items where both "blue" AND "widget" match
    const searchFilter = buildSearchFilter('blue widget', ['title', 'handle'])
    const [rows, count] = await service.listAndCountProducts(searchFilter)

    expect(count).toBe(1)
    expect(rows[0]?.title).toBe('Blue Widget')
  })

  test('listAndCountProducts with status filter', async ({ expect, dto }) => {
    await service.createProducts([
      dto.generate.createProduct({ status: 'published' }),
      dto.generate.createProduct({ status: 'draft' }),
      dto.generate.createProduct({ status: 'published' }),
    ])

    const [rows, count] = await service.listAndCountProducts({ status: 'published' })

    expect(count).toBe(2)
    expect(rows.every((r) => r.status === 'published')).toBe(true)
  })

  test('listAndCountProducts with created_at range filter', async ({ expect, dto }) => {
    const oneMinuteAgo = new Date(Date.now() - 60_000)
    await service.createProducts([dto.generate.createProduct(), dto.generate.createProduct()])

    const [rows, count] = await service.listAndCountProducts({
      createdAt: { $gte: oneMinuteAgo },
    })

    expect(count).toBe(2)
    expect(rows).toHaveLength(2)
  })

  test('createProducts auto-generates handle from title', async ({ expect }) => {
    const [product] = await service.createProducts([{ title: 'My Cool Product' }])
    assertDefined(product)

    expect(product.title).toBe('My Cool Product')
    expect(product.handle).toBe('my-cool-product')
    expect(product.id).toBeDefined()
    expect(product.status).toBe('draft')
    expect(product.createdAt).toBeInstanceOf(Date)
  })

  test('updateProducts', async ({ expect, dto }) => {
    const [created] = await service.createProducts([dto.generate.createProduct()])
    assertDefined(created)

    const [updated] = await service.updateProducts([created.id], { title: 'Updated Title' })
    assertDefined(updated)

    expect(updated.title).toBe('Updated Title')
    expect(updated.id).toBe(created.id)
  })

  test('deleteProducts soft-deletes and excludes from list', async ({ expect, dto }) => {
    const [created] = await service.createProducts([dto.generate.createProduct()])
    assertDefined(created)

    await service.deleteProducts([created.id])

    const products = await service.listProducts()
    expect(products).toHaveLength(0)
  })

  test('retrieveProduct by ID', async ({ expect, dto }) => {
    const [created] = await service.createProducts([dto.generate.createProduct()])
    assertDefined(created)

    const product = await service.retrieveProduct(created.id)

    expect(product.id).toBe(created.id)
    expect(product.title).toBe(created.title)
  })

  test('retrieveProduct throws NOT_FOUND for soft-deleted product', async ({ expect, dto }) => {
    const [created] = await service.createProducts([dto.generate.createProduct()])
    assertDefined(created)
    await service.deleteProducts([created.id])

    const error = await service.retrieveProduct(created.id).catch((e) => e)

    expect(AppError.isError(error)).toBe(true)
    expect(error.type).toBe(ErrorTypes.NOT_FOUND)
  })
})
