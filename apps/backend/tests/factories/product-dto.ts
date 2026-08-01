import type { CreateProductDTO, UpdateProductDTO } from '@core/types/index.js'
import { faker } from '@faker-js/faker'

export function generateCreateProductDTO(overrides?: Partial<CreateProductDTO>): CreateProductDTO {
  return {
    title: faker.commerce.productName(),
    ...overrides,
  }
}

export function generateUpdateProductDTO(overrides?: Partial<UpdateProductDTO>): UpdateProductDTO {
  return {
    title: faker.commerce.productName(),
    ...overrides,
  }
}
