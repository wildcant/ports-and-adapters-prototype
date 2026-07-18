/**
 * DRIVEN ADAPTER -- Prisma implementation of UserRepository.
 * Fulfills the exact same port as the Drizzle adapter.
 */

import type { PrismaClient } from '../../../../../generated/prisma/client.js'
import type { UserRepository } from '../../ports.js'

type Dependencies = {
  db: PrismaClient
}

export const createPrismaUserRepository = ({ db: prisma }: Dependencies): UserRepository => ({
  find: async () => {
    return prisma.user.findMany()
  },

  findById: async (id) => {
    return prisma.user.findUnique({ where: { id } })
  },

  create: async (data) => {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        created_at: new Date().toISOString(),
      },
    })
  },

  update: async (id, data) => {
    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return null
    return prisma.user.update({ where: { id }, data })
  },

  delete: async (id) => {
    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return false
    await prisma.user.delete({ where: { id } })
    return true
  },
})
