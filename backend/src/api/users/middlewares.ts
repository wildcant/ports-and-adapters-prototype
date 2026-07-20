import { IdParams } from '../../core/http-schemas/common.js'
import { CreateUser, UpdateUser } from '../../core/http-schemas/user/payloads.js'
import { UserDeleteResponse, UserListResponse, UserResponse } from '../../core/http-schemas/user/responses.js'
import type { MiddlewareRoute } from '../../core/middleware/types.js'
import { Tags } from '../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/users',
    operationId: 'listUsers',
    summary: 'List users',
    tags: [Tags.USERS],
    responseSchema: UserListResponse,
  },
  {
    method: 'POST',
    matcher: '/users',
    bodySchema: CreateUser,
    operationId: 'createUser',
    summary: 'Create a user',
    tags: [Tags.USERS],
    responseSchema: UserResponse,
  },
  {
    method: 'GET',
    matcher: '/users/:id',
    paramsSchema: IdParams,
    operationId: 'getUser',
    summary: 'Retrieve a user',
    tags: [Tags.USERS],
    responseSchema: UserResponse,
  },
  {
    method: 'PATCH',
    matcher: '/users/:id',
    paramsSchema: IdParams,
    bodySchema: UpdateUser,
    operationId: 'updateUser',
    summary: 'Update a user',
    tags: [Tags.USERS],
    responseSchema: UserResponse,
  },
  {
    method: 'DELETE',
    matcher: '/users/:id',
    paramsSchema: IdParams,
    operationId: 'deleteUser',
    summary: 'Delete a user',
    tags: [Tags.USERS],
    responseSchema: UserDeleteResponse,
  },
] satisfies MiddlewareRoute[]
