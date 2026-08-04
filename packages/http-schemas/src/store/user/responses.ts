import { z } from 'zod'
import { PaginatedResponse } from '../../common.js'
import { User } from './entities.js'

export const UserResponse = z.object({ user: User }).openapi('UserResponse')
export type UserResponse = z.input<typeof UserResponse>

export const UserListResponse = PaginatedResponse.extend({ users: z.array(User) }).openapi('UserListResponse')
export type UserListResponse = z.input<typeof UserListResponse>
