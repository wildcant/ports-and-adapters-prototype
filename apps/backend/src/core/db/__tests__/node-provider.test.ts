import postgres from 'postgres'
import { describe, expect, it } from 'vitest'
import { env } from '../../../env.js'
import { createNodeDbProvider } from '../node-provider.js'

describe('createNodeDbProvider', () => {
  const client = postgres(env.DATABASE_URL, { prepare: false })
  const provider = createNodeDbProvider(client)

  it('getDb always returns the same instance', () => {
    const a = provider.getDb()
    const b = provider.getDb()
    expect(a).toBe(b)
  })

  it('withConnection is a passthrough', async () => {
    const result = await provider.withConnection(async () => 42)
    expect(result).toBe(42)
  })
})
