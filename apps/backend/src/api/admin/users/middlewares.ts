import {
  CreateUser,
  IdParams,
  UpdateUser,
  UserDeleteResponse,
  UserListParams,
  UserListResponse,
  UserResponse,
} from '@proteus/http-schemas'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/admin/users',
    querySchema: UserListParams,
    operationId: 'listUsers',
    summary: 'List users',
    tags: [Tags.USERS],
    responseSchema: UserListResponse,
  },
  {
    method: 'POST',
    matcher: '/admin/users',
    bodySchema: CreateUser,
    operationId: 'createUser',
    summary: 'Create a user',
    tags: [Tags.USERS],
    responseSchema: UserResponse,
  },
  {
    method: 'GET',
    matcher: '/admin/users/:id',
    paramsSchema: IdParams,
    operationId: 'getUser',
    summary: 'Retrieve a user',
    tags: [Tags.USERS],
    responseSchema: UserResponse,
  },
  {
    method: 'PATCH',
    matcher: '/admin/users/:id',
    paramsSchema: IdParams,
    bodySchema: UpdateUser,
    operationId: 'updateUser',
    summary: 'Update a user',
    tags: [Tags.USERS],
    responseSchema: UserResponse,
  },
  {
    method: 'DELETE',
    matcher: '/admin/users/:id',
    paramsSchema: IdParams,
    operationId: 'deleteUser',
    summary: 'Delete a user',
    tags: [Tags.USERS],
    responseSchema: UserDeleteResponse,
  },
] satisfies MiddlewareRoute[]
