import { createServerFn } from '@tanstack/react-start'
import type { IdentityService } from 'backend/container'
import { container } from 'backend/container'

const getService = () => container.createScope().resolve<IdentityService>('identityService')

export const listUsers = createServerFn({ method: 'GET' }).handler(async () => {
  const service = getService()
  const users = await service.listUsers()
  return users
})

export const createUser = createServerFn({ method: 'POST' })
  .validator((data: { name: string; email: string }) => data)
  .handler(async ({ data }) => {
    const service = getService()
    return await service.createUser(data)
  })

export const deleteUser = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const service = getService()
    return await service.deleteUser(data.id)
  })
