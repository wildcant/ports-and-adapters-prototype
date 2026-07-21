import { z } from 'zod'
import { PaginatedResponse } from '../common.js'
import { User } from './entities.js'

export const UserResponse = z.object({ user: User }).openapi('UserResponse')
export type UserResponse = z.infer<typeof UserResponse>

export const UserListResponse = PaginatedResponse.extend({ users: z.array(User) }).openapi('UserListResponse')
export type UserListResponse = z.infer<typeof UserListResponse>

export const UserDeleteResponse = z.object({ id: z.string(), deleted: z.boolean() }).openapi('UserDeleteResponse')
export type UserDeleteResponse = z.infer<typeof UserDeleteResponse>
