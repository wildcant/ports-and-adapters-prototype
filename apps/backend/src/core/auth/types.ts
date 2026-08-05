import type { JwtPayload } from 'jsonwebtoken'

export type ActorType = 'user' | 'customer'

export type AuthContext = {
  actorId: string
  actorType: ActorType
  authIdentityId: string
  authProvider: string
  // TODO: define concrete types once metadata shape is settled
  appMetadata: Record<string, unknown>
  userMetadata: Record<string, unknown>
}

export type AuthTokenPayload = AuthContext & Partial<JwtPayload>
