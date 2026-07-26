import { describe, expect, it } from 'vitest'
import { env } from '../../../env.js'
import { createWorkersDbProvider } from '../workers-provider.js'

describe('createWorkersDbProvider', () => {
  const provider = createWorkersDbProvider(env.DATABASE_URL)

  it('getDb throws outside withConnection', () => {
    expect(() => provider.getDb()).toThrow('Called outside withConnection()')
  })

  it('getDb returns a valid drizzle instance inside withConnection', async () => {
    await provider.withConnection(async () => {
      const db = provider.getDb()
      expect(db).toBeDefined()
      expect(typeof db.select).toBe('function')
    })
  })

  it('each withConnection call creates a fresh instance', async () => {
    let firstDb: unknown
    let secondDb: unknown

    await provider.withConnection(async () => {
      firstDb = provider.getDb()
    })
    await provider.withConnection(async () => {
      secondDb = provider.getDb()
    })

    expect(firstDb).not.toBe(secondDb)
  })
})
