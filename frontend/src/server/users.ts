import { createServerFn } from '@tanstack/react-start'
import { apiCall, userByIdApi, usersApi } from 'backend/api'
import { CreateUser, IdParams, UpdateUser, UserListParams } from 'backend/validators'

export const listUsers = createServerFn({ method: 'GET' })
  .validator(UserListParams)
  .handler(async ({ data }) => apiCall(usersApi.GET, { query: data }))

export const createUser = createServerFn({ method: 'POST' })
  .validator(CreateUser)
  .handler(async ({ data }) => apiCall(usersApi.POST, { body: data }))

export const updateUser = createServerFn({ method: 'POST' })
  .validator(IdParams.extend(UpdateUser.shape))
  .handler(async ({ data: { id, ...body } }) => apiCall(userByIdApi.PATCH, { params: { id }, body }))

export const deleteUser = createServerFn({ method: 'POST' })
  .validator(IdParams)
  .handler(async ({ data }) => apiCall(userByIdApi.DELETE, { params: data }))
