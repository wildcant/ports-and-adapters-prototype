/**
 * SERVICE -- Business logic. Depends ONLY on the ports, never on adapters.
 * Receives the repository via Awilix injection (FP factory style).
 */

import type { IdentityService, UserRepository } from './ports.js'

type Dependencies = {
  userRepository: UserRepository
}

export const createIdentityService = ({ userRepository }: Dependencies): IdentityService => {
  return {
    listUsers: () => userRepository.find(),

    getUser: async (id) => {
      const user = await userRepository.findById(id)
      if (!user) {
        throw new Error(`User with id "${id}" not found`)
      }
      return user
    },

    createUser: async (data) => {
      if (!data.email?.includes('@')) {
        throw new Error('A valid email is required')
      }
      return userRepository.create(data)
    },

    updateUser: async (id, data) => {
      if (data.email && !data.email.includes('@')) {
        throw new Error('A valid email is required')
      }
      const updated = await userRepository.update(id, data)
      if (!updated) {
        throw new Error(`User with id "${id}" not found`)
      }
      return updated
    },

    deleteUser: async (id) => {
      const deleted = await userRepository.delete(id)
      if (!deleted) {
        throw new Error(`User with id "${id}" not found`)
      }
      return { id, deleted: true }
    },
  }
}
