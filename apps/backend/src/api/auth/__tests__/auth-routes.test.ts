import type { DbProvider } from '@core/db/ports.js'
import type { IAuthModuleService } from '@core/types/index.js'
import { Modules } from '@core/utils/index.js'
import { test } from '@tests/setup/test-extend.js'
import jwt from 'jsonwebtoken'
import { describe, vi } from 'vitest'
import type { App, RouteHandler } from '../../../server/ports.js'

const SECRET = vi.hoisted(() => 'test-jwt-secret-for-testing-only')

vi.mock('../../../env.js', () => ({
  env: {
    JWT_SECRET: SECRET,
    JWT_EXPIRES_IN: '1d',
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    LOG_FILE: '',
    CORS_ORIGIN: [],
    RUNTIME: 'workerd',
    STRIPE_SECRET_KEY: 'sk_test_xxxx',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_xxxx',
  },
}))

import { applyMiddleware } from '@core/middleware/apply-middleware.js'
import { bootstrapContainer } from '../../../container.js'
import { createApp } from '../../../server/app.js'
import * as authRegister from '../[actorType]/[authProvider]/register/route.js'
import * as authAuthenticate from '../[actorType]/[authProvider]/route.js'
import authMiddlewares from '../middlewares.js'
import * as authTokenRefresh from '../token/refresh/route.js'

let app: App
let authService: IAuthModuleService

test.beforeEach(async ({ getDb, logger }) => {
  const dbProvider: DbProvider = {
    getDb,
    withConnection: (fn) => fn(),
  }
  const container = await bootstrapContainer({ logger, dbProvider })
  authService = container.resolve<IAuthModuleService>(Modules.AUTH)
  app = createApp({ container })

  // Specific routes before parametric to avoid /auth/token/refresh matching /:actorType/:authProvider
  const routes = [
    { path: '/auth/:actorType/:authProvider/register', module: authRegister },
    { path: '/auth/token/refresh', module: authTokenRefresh },
    { path: '/auth/:actorType/:authProvider', module: authAuthenticate },
  ] as const

  for (const { path, module } of routes) {
    for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const) {
      const handler = (module as Record<string, unknown>)[method] as RouteHandler | undefined
      if (typeof handler !== 'function') continue
      const config = authMiddlewares.find((m) => m.matcher === path && m.method === method)
      const finalHandler = config ? applyMiddleware(config, handler) : handler
      app.addRoute(method, path, finalHandler)
    }
  }
})

async function post(path: string, body?: unknown, headers?: Record<string, string>) {
  const response = await app.fetch(
    new Request(`http://test${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    }),
  )
  return { status: response.status, body: (await response.json()) as Record<string, unknown> }
}

describe('POST /auth/:actorType/:authProvider/register', () => {
  test('returns actorless JWT', async ({ expect }) => {
    const { status, body } = await post('/auth/user/emailpass/register', {
      email: 'reg@example.com',
      password: 'secret123',
    })

    expect(status).toBe(200)
    expect(body.token).toBeDefined()

    const decoded = jwt.verify(body.token as string, SECRET) as Record<string, unknown>
    expect(decoded.actorId).toBe('')
    expect(decoded.actorType).toBe('user')
    expect(decoded.authProvider).toBe('emailpass')
    expect(decoded.authIdentityId).toMatch(/^authid_/)
  })
})

describe('POST /auth/:actorType/:authProvider (authenticate)', () => {
  test('login without linked actor returns actorless JWT', async ({ expect }) => {
    await post('/auth/user/emailpass/register', {
      email: 'noactor@example.com',
      password: 'secret123',
    })

    const { status, body } = await post('/auth/user/emailpass', {
      email: 'noactor@example.com',
      password: 'secret123',
    })

    expect(status).toBe(200)
    const decoded = jwt.verify(body.token as string, SECRET) as Record<string, unknown>
    expect(decoded.actorId).toBe('')
    expect(decoded.actorType).toBe('user')
  })

  test('login with linked actor returns full JWT', async ({ expect }) => {
    const { body: regBody } = await post('/auth/user/emailpass/register', {
      email: 'linked@example.com',
      password: 'secret123',
    })

    // Simulate linking: set userId in app_metadata
    const regDecoded = jwt.verify(regBody.token as string, SECRET) as Record<string, unknown>
    const authIdentityId = regDecoded.authIdentityId as string
    await authService.updateAuthIdentities([authIdentityId], {
      appMetadata: { registered: true, userId: 'usr_linked' },
    })

    const { status, body } = await post('/auth/user/emailpass', {
      email: 'linked@example.com',
      password: 'secret123',
    })

    expect(status).toBe(200)
    expect(body.verificationRequired).toBeUndefined()
    const decoded = jwt.verify(body.token as string, SECRET) as Record<string, unknown>
    expect(decoded.actorId).toBe('usr_linked')
    expect(decoded.actorType).toBe('user')
  })
})

describe('POST /auth/token/refresh', () => {
  test('picks up app_metadata changes on full token refresh', async ({ expect }) => {
    // Register
    const { body: regBody } = await post('/auth/user/emailpass/register', {
      email: 'refresh@example.com',
      password: 'secret123',
    })
    const regDecoded = jwt.verify(regBody.token as string, SECRET) as Record<string, unknown>
    const authIdentityId = regDecoded.authIdentityId as string

    // Simulate linking
    await authService.updateAuthIdentities([authIdentityId], {
      appMetadata: { registered: true, userId: 'usr_refresh' },
    })

    // Login to get a full token (with actorId)
    const { body: loginBody } = await post('/auth/user/emailpass', {
      email: 'refresh@example.com',
      password: 'secret123',
    })

    // Update app_metadata again (simulate role change)
    await authService.updateAuthIdentities([authIdentityId], {
      appMetadata: { registered: true, userId: 'usr_refresh', role: 'admin' },
    })

    // Refresh — should pick up the new role
    const { status, body } = await post('/auth/token/refresh', undefined, {
      authorization: `Bearer ${loginBody.token as string}`,
    })

    expect(status).toBe(200)
    const decoded = jwt.verify(body.token as string, SECRET) as Record<string, unknown>
    expect(decoded.actorId).toBe('usr_refresh')
    const appMetadata = decoded.appMetadata as Record<string, unknown>
    expect(appMetadata.role).toBe('admin')
  })

  test('actorless token refresh re-runs verification checks', async ({ expect }) => {
    // Register (get actorless token)
    const { body: regBody } = await post('/auth/user/emailpass/register', {
      email: 'actorless-refresh@example.com',
      password: 'secret123',
    })
    const regDecoded = jwt.verify(regBody.token as string, SECRET) as Record<string, unknown>
    const authIdentityId = regDecoded.authIdentityId as string

    // Simulate linking after invite accept
    await authService.updateAuthIdentities([authIdentityId], {
      appMetadata: { registered: true, userId: 'usr_refreshed' },
    })

    // Refresh with the actorless token — should get full token now
    const { status, body } = await post('/auth/token/refresh', undefined, {
      authorization: `Bearer ${regBody.token as string}`,
    })

    expect(status).toBe(200)
    const decoded = jwt.verify(body.token as string, SECRET) as Record<string, unknown>
    expect(decoded.actorId).toBe('usr_refreshed')
  })
})

describe('validateScopeProviderAssociation', () => {
  test('rejects disallowed provider for actor type', async ({ expect }) => {
    const { status, body } = await post('/auth/user/google/register', {
      email: 'blocked@example.com',
      password: 'secret123',
    })

    expect(status).toBe(400)
    expect(body.message).toMatch(/not allowed/)
  })
})
