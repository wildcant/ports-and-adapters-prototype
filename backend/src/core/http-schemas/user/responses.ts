import { z } from 'zod'
import { User } from './entities.js'

export const UserResponse = z.object({ user: User })
export const UserListResponse = z.object({ users: z.array(User) })
export const UserDeleteResponse = z.object({ id: z.string(), deleted: z.boolean() })
