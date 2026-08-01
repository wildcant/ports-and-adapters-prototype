import { z } from 'zod'
import { PaginatedResponse } from '../../common.js'
import { AdminUser } from './entities.js'

export const AdminUserResponse = z.object({ user: AdminUser }).openapi('AdminUserResponse')
export type AdminUserResponse = z.infer<typeof AdminUserResponse>

export const AdminUserListResponse = PaginatedResponse.extend({ users: z.array(AdminUser) }).openapi(
  'AdminUserListResponse',
)
export type AdminUserListResponse = z.infer<typeof AdminUserListResponse>

export const AdminUserDeleteResponse = z
  .object({ id: z.string(), deleted: z.boolean() })
  .openapi('AdminUserDeleteResponse')
export type AdminUserDeleteResponse = z.infer<typeof AdminUserDeleteResponse>
