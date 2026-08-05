import { authenticate } from '@core/auth/middleware/authenticate.js'
import { validateScopeProviderAssociation } from '@core/auth/utils/validate-scope-provider-association.js'
import {
  AuthBody,
  AuthenticateResponse,
  AuthParams,
  AuthTokenResponse,
  VerificationConfirmBody,
  VerificationConfirmResponse,
  VerificationRequestBody,
  VerificationRequestResponse,
} from '@proteus/http-schemas/auth'
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
  {
    method: 'POST',
    matcher: '/auth/verification/request',
    middlewares: [authenticate('*', { allowUnregistered: true })],
    bodySchema: VerificationRequestBody,
    operationId: 'authVerificationRequest',
    summary: 'Request a verification code',
    tags: [Tags.AUTH],
    responseSchema: VerificationRequestResponse,
  },
  {
    method: 'POST',
    matcher: '/auth/verification/confirm',
    middlewares: [authenticate('*', { allowUnregistered: true })],
    bodySchema: VerificationConfirmBody,
    operationId: 'authVerificationConfirm',
    summary: 'Confirm a verification code',
    tags: [Tags.AUTH],
    responseSchema: VerificationConfirmResponse,
  },
] satisfies MiddlewareRoute[]
