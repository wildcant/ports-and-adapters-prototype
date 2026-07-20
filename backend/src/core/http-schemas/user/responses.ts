import { z } from 'zod'
import { User } from './entities.js'

export const UserResponse = z.object({ user: User }).openapi('UserResponse')
export const UserListResponse = z.object({ users: z.array(User) }).openapi('UserListResponse')
export const UserDeleteResponse = z.object({ id: z.string(), deleted: z.boolean() }).openapi('UserDeleteResponse')
