import '../../openapi/setup.js'
import { z } from 'zod'

export const CreateCustomer = z
  .object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.email(),
  })
  .openapi('CreateCustomer')

export const CreateCustomers = z.array(CreateCustomer)

export const UpdateCustomer = z
  .object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    email: z.email().optional(),
  })
  .openapi('UpdateCustomer')
