import { describe, expect, test } from 'vitest'
import type { HttpRequest } from '../../../server/ports.js'
import { ErrorTypes } from '../../errors/app-error.js'
import { validateScopeProviderAssociation } from '../utils/validate-scope-provider-association.js'

function makeRequest(params: Record<string, string>): HttpRequest {
  return {
    params,
    query: {},
    validatedQuery: {},
    body: undefined,
    scope: {} as HttpRequest['scope'],
    headers: {},
  }
}

describe('validateScopeProviderAssociation', () => {
  const middleware = validateScopeProviderAssociation()

  test('allows configured provider for actor type', async () => {
    const result = await middleware(makeRequest({ actorType: 'user', authProvider: 'emailpass' }))
    expect(result.params.actorType).toBe('user')
  })

  test('rejects unconfigured provider for actor type', async () => {
    await expect(middleware(makeRequest({ actorType: 'user', authProvider: 'google' }))).rejects.toMatchObject({
      type: ErrorTypes.NOT_ALLOWED,
    })
  })

  test('rejects unknown actor type', async () => {
    await expect(
      middleware(makeRequest({ actorType: 'unknown_type', authProvider: 'anything' })),
    ).rejects.toMatchObject({
      type: ErrorTypes.NOT_ALLOWED,
    })
  })
})
