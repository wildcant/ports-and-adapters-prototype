import { z } from 'zod'
import { PaginatedResponse } from '../../common.js'
import { AdminUser } from '../user/entities.js'
import { AdminInvite } from './entities.js'

export const AdminInviteResponse = z.object({ invite: AdminInvite }).openapi('AdminInviteResponse')
export type AdminInviteResponse = z.input<typeof AdminInviteResponse>

export const AdminInviteListResponse = PaginatedResponse.extend({ invites: z.array(AdminInvite) }).openapi(
  'AdminInviteListResponse',
)
export type AdminInviteListResponse = z.input<typeof AdminInviteListResponse>

export const AdminAcceptInviteResponse = z.object({ user: AdminUser }).openapi('AdminAcceptInviteResponse')
export type AdminAcceptInviteResponse = z.input<typeof AdminAcceptInviteResponse>
