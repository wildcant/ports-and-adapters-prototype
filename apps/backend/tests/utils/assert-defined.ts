import { expect } from 'vitest'

export function assertDefined<T>(value: T | null | undefined): asserts value is NonNullable<T> {
  expect(value).not.toBeNull()
  expect(value).toBeDefined()
}
