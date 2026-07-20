import '../../openapi/setup.js'
import { z } from 'zod'

export const CreateUser = z
  .object({
    name: z.string().min(1),
    email: z.email(),
  })
  .openapi('CreateUser')

export const UpdateUser = z
  .object({
    name: z.string().min(1).optional(),
    email: z.email().optional(),
  })
  .openapi('UpdateUser')
