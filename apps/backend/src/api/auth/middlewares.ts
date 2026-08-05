import { authenticate } from '@core/auth/middleware/authenticate.js'
import { validateScopeProviderAssociation } from '@core/auth/utils/validate-scope-provider-association.js'
import { AuthBody, AuthenticateResponse, AuthParams, AuthTokenResponse } from '@proteus/http-schemas/auth'
import type { MiddlewareRoute } from '../../core/middleware/types.js'
import { Tags } from '../../core/middleware/types.js'

export default [
  {
    method: 'POST',
    matcher: '/auth/:actorType/:authProvider/register',
    middlewares: [validateScopeProviderAssociation()],
    paramsSchema: AuthParams,
    bodySchema: AuthBody,
    operationId: 'authRegister',
    summary: 'Register with an auth provider',
    tags: [Tags.AUTH],
    responseSchema: AuthTokenResponse,
  },
  {
    method: 'POST',
    matcher: '/auth/:actorType/:authProvider',
    middlewares: [validateScopeProviderAssociation()],
    paramsSchema: AuthParams,
    bodySchema: AuthBody,
    operationId: 'authAuthenticate',
    summary: 'Authenticate with an auth provider',
    tags: [Tags.AUTH],
    responseSchema: AuthenticateResponse,
  },
  {
    method: 'POST',
    matcher: '/auth/token/refresh',
    middlewares: [authenticate('*', { allowUnregistered: true })],
    operationId: 'authTokenRefresh',
    summary: 'Refresh an auth token',
    tags: [Tags.AUTH],
    responseSchema: AuthenticateResponse,
  },
] satisfies MiddlewareRoute[]
