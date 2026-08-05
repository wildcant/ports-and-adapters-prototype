import {
  AdminCreateUser,
  AdminUpdateUser,
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserResponse,
  DeleteResponse,
  IdParams,
} from '@proteus/http-schemas/admin'
import type { MiddlewareRoute } from '../../../core/middleware/types.js'
import { Tags } from '../../../core/middleware/types.js'

export default [
  {
    method: 'GET',
    matcher: '/admin/users/me',
    operationId: 'getMe',
    summary: 'Retrieve the authenticated user',
    tags: [Tags.USERS],
    responseSchema: AdminUserResponse,
  },
  {
    method: 'GET',
    matcher: '/admin/users',
    querySchema: AdminUserListParams,
    operationId: 'listUsers',
    summary: 'List users',
    tags: [Tags.USERS],
    responseSchema: AdminUserListResponse,
  },
  {
    method: 'POST',
    matcher: '/admin/users',
    bodySchema: AdminCreateUser,
    operationId: 'createUser',
    summary: 'Create a user',
    tags: [Tags.USERS],
    responseSchema: AdminUserResponse,
  },
  {
    method: 'GET',
    matcher: '/admin/users/:id',
    paramsSchema: IdParams,
    operationId: 'getUser',
    summary: 'Retrieve a user',
    tags: [Tags.USERS],
    responseSchema: AdminUserResponse,
  },
  {
    method: 'PATCH',
    matcher: '/admin/users/:id',
    paramsSchema: IdParams,
    bodySchema: AdminUpdateUser,
    operationId: 'updateUser',
    summary: 'Update a user',
    tags: [Tags.USERS],
    responseSchema: AdminUserResponse,
  },
  {
    method: 'DELETE',
    matcher: '/admin/users/:id',
    paramsSchema: IdParams,
    operationId: 'deleteUser',
    summary: 'Delete a user',
    tags: [Tags.USERS],
    responseSchema: DeleteResponse,
  },
] satisfies MiddlewareRoute[]
