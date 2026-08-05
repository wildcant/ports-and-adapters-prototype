import jwt from 'jsonwebtoken'
import { env } from '../../../env.js'
import { AppError, ErrorTypes } from '../../errors/app-error.js'
import type { MiddlewareFunction } from '../../middleware/types.js'
import type { ActorType, AuthContext, AuthTokenPayload } from '../types.js'

type AuthenticateOptions = {
  allowUnauthenticated?: boolean
  allowUnregistered?: boolean
}

/**
 * Extract and verify an AuthContext from a JWT bearer token.
 * Returns null if the header is missing/malformed (caller decides whether that's an error).
 */
function getAuthContextFromJwtToken(authHeader: string | undefined, actorTypes: ActorType[]): AuthContext | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  if (!token) {
    return null
  }

  // Explicit own-properties so a polluted Object.prototype can't silently disable expiry checks
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    ignoreExpiration: false,
    ignoreNotBefore: false,
  })

  if (typeof decoded !== 'object' || decoded === null) {
    return null
  }

  // Own-property access only — prototype pollution defense
  const payload = Object.assign(Object.create(null), decoded) as AuthTokenPayload

  if (!payload.actorType || !actorTypes.includes(payload.actorType)) {
    throw new AppError({
      type: ErrorTypes.UNAUTHORIZED,
      message: 'Unauthorized: invalid actor type',
    })
  }

  return {
    actorId: payload.actorId,
    actorType: payload.actorTyp,
    authIdentityId: payload.authIdentityId,
    authProvider: payload.authProvider,
    appMetadata: payload.appMetadata,
    userMetadata: payload.userMetadata,
  }
}

/**
 * Middleware factory that verifies JWT bearer tokens and populates `req.authContext`.
 *
 * Decision tree:
 * 1. No token -> allowUnauthenticated? proceed with no authContext : 401
 * 2. Invalid/expired token -> 401 (always)
 * 3. Valid token, empty actorId -> allowUnregistered? proceed : 401
 * 4. Valid token, has actorId -> proceed
 */
export function authenticate(actorType: ActorType, options?: AuthenticateOptions): MiddlewareFunction {
  const { allowUnauthenticated = false, allowUnregistered = false } = options ?? {}

  return async (req) => {
    let authContext: AuthContext | null = null
    try {
      authContext = getAuthContextFromJwtToken(req.headers.authorization, [actorType])
    } catch (err) {
      if (AppError.isError(err)) throw err
      // jwt.verify errors (expired, malformed, etc.) -> 401
      throw new AppError({
        type: ErrorTypes.UNAUTHORIZED,
        message: 'Unauthorized: invalid token',
      })
    }

    // No token present
    if (!authContext) {
      if (allowUnauthenticated) {
        return req
      }
      throw new AppError({
        type: ErrorTypes.UNAUTHORIZED,
        message: 'Unauthorized',
      })
    }

    // Token valid but no actorId (unregistered session)
    if (!authContext.actorId) {
      if (!allowUnregistered) {
        throw new AppError({
          type: ErrorTypes.UNAUTHORIZED,
          message: 'Unauthorized: registration required',
        })
      }
    }

    return { ...req, authContext }
  }
}
