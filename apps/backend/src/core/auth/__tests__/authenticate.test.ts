import { afterEach, describe, expect, test, vi } from 'vitest'
import type { HttpRequest } from '../../../server/ports.js'
import { ErrorTypes } from '../../errors/app-error.js'
import { authenticate } from '../middleware/authenticate.js'
import { generateJwtToken } from '../utils/token.js'

const SECRET = 'test-jwt-secret-for-testing-only'

// Mock the env module so tests don't depend on actual env vars
// Factory is hoisted above const declarations, so the value must be inlined
vi.mock('../../../env.js', () => ({
  env: {
    JWT_SECRET: 'test-jwt-secret-for-testing-only',
  },
}))

function makeRequest(overrides: Partial<HttpRequest> = {}): HttpRequest {
  return {
    params: {},
    query: {},
    validatedQuery: {},
    body: undefined,
    scope: {} as HttpRequest['scope'],
    headers: {},
    ...overrides,
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('authenticate middleware', () => {
  describe('valid token', () => {
    test('populates authContext from JWT payload', async () => {
      const middleware = authenticate('user')
      const token = generateJwtToken(
        {
          actorId: 'usr_123',
          actorType: 'user',
          authIdentityId: 'authid_456',
          authProvider: 'emailpass',
          appMetadata: { registered: true },
          userMetadata: { name: 'Test' },
        },
        { secret: SECRET, expiresIn: '1d' },
      )

      const result = await middleware(
        makeRequest({
          headers: { authorization: `Bearer ${token}` },
        }),
      )

      expect(result.authContext).toEqual({
        actorId: 'usr_123',
        actorType: 'user',
        authIdentityId: 'authid_456',
        authProvider: 'emailpass',
        appMetadata: { registered: true },
        userMetadata: { name: 'Test' },
      })
    })
  })

  describe('expired token', () => {
    test('throws 401', async () => {
      vi.useFakeTimers()
      const middleware = authenticate('user')
      const token = generateJwtToken(
        {
          actorId: 'usr_123',
          actorType: 'user',
          authIdentityId: 'authid_1',
          authProvider: 'emailpass',
          appMetadata: {},
          userMetadata: {},
        },
        { secret: SECRET, expiresIn: '1h' },
      )

      vi.advanceTimersByTime(2 * 60 * 60 * 1000)

      await expect(middleware(makeRequest({ headers: { authorization: `Bearer ${token}` } }))).rejects.toMatchObject({
        type: ErrorTypes.UNAUTHORIZED,
      })
    })
  })

  describe('missing token on protected route', () => {
    test('throws 401', async () => {
      const middleware = authenticate('user')

      await expect(middleware(makeRequest())).rejects.toMatchObject({
        type: ErrorTypes.UNAUTHORIZED,
      })
    })
  })

  describe('wrong actor type', () => {
    test('throws 401 when token has customer type but route expects user', async () => {
      const middleware = authenticate('user')
      const token = generateJwtToken(
        {
          actorId: 'cus_123',
          actorType: 'customer',
          authIdentityId: 'authid_1',
          authProvider: 'emailpass',
          appMetadata: {},
          userMetadata: {},
        },
        { secret: SECRET, expiresIn: '1d' },
      )

      await expect(middleware(makeRequest({ headers: { authorization: `Bearer ${token}` } }))).rejects.toMatchObject({
        type: ErrorTypes.UNAUTHORIZED,
      })
    })
  })

  describe('actorless token (empty actorId)', () => {
    test('blocked on regular admin routes', async () => {
      const middleware = authenticate('user')
      const token = generateJwtToken(
        {
          actorId: '',
          actorType: 'user',
          authIdentityId: 'authid_789',
          authProvider: 'emailpass',
          appMetadata: {},
          userMetadata: {},
        },
        { secret: SECRET, expiresIn: '1d' },
      )

      await expect(middleware(makeRequest({ headers: { authorization: `Bearer ${token}` } }))).rejects.toMatchObject({
        type: ErrorTypes.UNAUTHORIZED,
        message: 'Unauthorized: registration required',
      })
    })

    test('allowed with allowUnregistered: true', async () => {
      const middleware = authenticate('user', { allowUnregistered: true })
      const token = generateJwtToken(
        {
          actorId: '',
          actorType: 'user',
          authIdentityId: 'authid_789',
          authProvider: 'emailpass',
          appMetadata: {},
          userMetadata: {},
        },
        { secret: SECRET, expiresIn: '1d' },
      )

      const result = await middleware(makeRequest({ headers: { authorization: `Bearer ${token}` } }))

      expect(result.authContext).toBeDefined()
      expect(result.authContext?.actorId).toBe('')
    })
  })

  describe('allowUnauthenticated', () => {
    test('missing token allowed with allowUnauthenticated: true', async () => {
      const middleware = authenticate('customer', { allowUnauthenticated: true })

      const result = await middleware(makeRequest())

      expect(result.authContext).toBeUndefined()
    })

    test('valid token still populates authContext', async () => {
      const middleware = authenticate('customer', { allowUnauthenticated: true })
      const token = generateJwtToken(
        {
          actorId: 'cus_123',
          actorType: 'customer',
          authIdentityId: 'authid_1',
          authProvider: 'emailpass',
          appMetadata: {},
          userMetadata: {},
        },
        { secret: SECRET, expiresIn: '1d' },
      )

      const result = await middleware(makeRequest({ headers: { authorization: `Bearer ${token}` } }))

      expect(result.authContext).toBeDefined()
      expect(result.authContext?.actorId).toBe('cus_123')
    })
  })

  describe('malformed tokens', () => {
    test('garbage token throws 401', async () => {
      const middleware = authenticate('user')

      await expect(
        middleware(makeRequest({ headers: { authorization: 'Bearer not-a-valid-jwt' } })),
      ).rejects.toMatchObject({ type: ErrorTypes.UNAUTHORIZED })
    })

    test('token signed with wrong secret throws 401', async () => {
      const middleware = authenticate('user')
      const token = generateJwtToken(
        {
          actorId: 'usr_1',
          actorType: 'user',
          authIdentityId: 'authid_1',
          authProvider: 'emailpass',
          appMetadata: {},
          userMetadata: {},
        },
        { secret: 'wrong-secret', expiresIn: '1d' },
      )

      await expect(middleware(makeRequest({ headers: { authorization: `Bearer ${token}` } }))).rejects.toMatchObject({
        type: ErrorTypes.UNAUTHORIZED,
      })
    })
  })
})
