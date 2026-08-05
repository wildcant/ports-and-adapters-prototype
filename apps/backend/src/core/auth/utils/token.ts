import jwt, { type SignOptions } from 'jsonwebtoken'
import type { StringValue } from 'ms'
import { AppError, ErrorTypes } from '../../errors/app-error.js'
import type { AuthTokenPayload } from '../types.js'

type JwtConfig = {
  secret: string
  expiresIn: StringValue | number
  jwtOptions?: SignOptions
}

export function generateJwtToken(payload: AuthTokenPayload, jwtConfig: JwtConfig): string {
  if (!jwtConfig.secret) {
    throw new AppError({ type: ErrorTypes.INVALID_ARGUMENT, message: 'JWT secret is required to generate a token' })
  }
  if (!jwtConfig.expiresIn) {
    throw new AppError({ type: ErrorTypes.INVALID_ARGUMENT, message: 'JWT expiresIn is required to generate a token' })
  }

  const options: SignOptions = { ...jwtConfig.jwtOptions, expiresIn: jwtConfig.expiresIn }
  return jwt.sign(payload, jwtConfig.secret, options)
}
