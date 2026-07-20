import { createServerFn } from '@tanstack/react-start'
import { apiCall, userByIdApi, usersApi } from 'backend/api'
import { CreateUser, IdParams, UpdateUser } from 'backend/validators'

export const listUsers = createServerFn({ method: 'GET' }).handler(apiCall(usersApi.GET))

export const createUser = createServerFn({ method: 'POST' }).validator(CreateUser).handler(apiCall(usersApi.POST))

export const updateUser = createServerFn({ method: 'POST' })
  .validator(IdParams.extend(UpdateUser.shape))
  .handler(apiCall(userByIdApi.PATCH, ({ id, ...body }) => ({ params: { id }, body })))

export const deleteUser = createServerFn({ method: 'POST' })
  .validator(IdParams)
  .handler(apiCall(userByIdApi.DELETE, (data) => ({ params: data })))
