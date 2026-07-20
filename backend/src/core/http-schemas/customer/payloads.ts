import '../../openapi/setup.js'
import { z } from 'zod'

export const CreateCustomer = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
  })
  .openapi('CreateCustomer')

export const CreateCustomers = z.array(CreateCustomer)

export const UpdateCustomer = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.email().optional(),
  })
  .openapi('UpdateCustomer')
