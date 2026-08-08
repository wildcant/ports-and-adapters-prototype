export { authenticate } from '@framework/http/middlewares/authenticate.js'
export type { AuthContext, AuthTokenPayload } from './types.js'
export type { AuthJwtConfig } from './utils/generate-jwt-token.js'
export {
  generateJwtTokenForAuthIdentity,
  generateJwtTokenWithChecks,
  getAuthJwtConfig,
} from './utils/generate-jwt-token.js'
export { generateJwtToken } from './utils/token.js'
export { validateScopeProviderAssociation } from './utils/validate-scope-provider-association.js'
export { validateVerification } from './utils/validate-verification.js'
