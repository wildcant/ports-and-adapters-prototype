import { z } from 'zod'

export const IdParams = z.object({ id: z.string().min(1) })
export type IdParams = z.infer<typeof IdParams>

const defaultPagination = { offset: 0, limit: 20 }

export function createFindParams(defaults?: { limit?: number; offset?: number }) {
  return z.object({
    offset: z.coerce
      .number()
      .int()
      .min(0)
      .default(defaults?.offset ?? defaultPagination.offset),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(defaults?.limit ?? defaultPagination.limit),
    order: z.string().optional(),
  })
}

export const PaginatedResponse = z.object({
  count: z.number(),
  offset: z.number(),
  limit: z.number(),
})

export type FindParams<TParams extends z.ZodType = z.ZodTypeAny> = {
  pagination: {
    offset: number
    limit: number
    order?: Record<string, 'ASC' | 'DESC'>
  }
  filters: Omit<z.infer<TParams>, 'offset' | 'limit' | 'order'>
}
