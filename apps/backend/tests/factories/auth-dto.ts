import type {
  AuthIdentityDTO,
  AuthPasswordResetTokenDTO,
  AuthVerificationDTO,
  CreateAuthIdentityDTO,
  CreateAuthPasswordResetTokenDTO,
  CreateAuthVerificationDTO,
  CreateProviderIdentityDTO,
  ProviderIdentityDTO,
  UpdateAuthIdentityDTO,
  UpdateAuthVerificationDTO,
  UpdateProviderIdentityDTO,
} from '@core/types/index.js'
import { faker } from '@faker-js/faker'

// --- AuthIdentity ---

export function generateCreateAuthIdentityDTO(overrides?: Partial<CreateAuthIdentityDTO>): CreateAuthIdentityDTO {
  return {
    appMetadata: null,
    ...overrides,
  }
}

export function generateUpdateAuthIdentityDTO(overrides?: Partial<UpdateAuthIdentityDTO>): UpdateAuthIdentityDTO {
  return {
    appMetadata: { role: faker.helpers.arrayElement(['admin', 'user', 'moderator']) },
    ...overrides,
  }
}

export function generateAuthIdentityDTO(overrides?: Partial<AuthIdentityDTO>): AuthIdentityDTO {
  return {
    id: `authid_${faker.string.alphanumeric(32)}`,
    appMetadata: null,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    deletedAt: null,
    ...overrides,
  }
}

// --- ProviderIdentity ---

export function generateCreateProviderIdentityDTO(
  overrides?: Partial<CreateProviderIdentityDTO>,
): CreateProviderIdentityDTO {
  return {
    authIdentityId: `authid_${faker.string.alphanumeric(32)}`,
    entityId: faker.internet.email(),
    provider: 'email-password',
    providerMetadata: null,
    userMetadata: null,
    ...overrides,
  }
}

export function generateUpdateProviderIdentityDTO(
  overrides?: Partial<UpdateProviderIdentityDTO>,
): UpdateProviderIdentityDTO {
  return {
    providerMetadata: { passwordHash: faker.string.alphanumeric(64) },
    ...overrides,
  }
}

export function generateProviderIdentityDTO(overrides?: Partial<ProviderIdentityDTO>): ProviderIdentityDTO {
  return {
    id: `provid_${faker.string.alphanumeric(32)}`,
    authIdentityId: `authid_${faker.string.alphanumeric(32)}`,
    entityId: faker.internet.email(),
    provider: 'email-password',
    providerMetadata: null,
    userMetadata: null,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    deletedAt: null,
    ...overrides,
  }
}

// --- AuthVerification ---

export function generateCreateAuthVerificationDTO(
  overrides?: Partial<CreateAuthVerificationDTO>,
): CreateAuthVerificationDTO {
  return {
    authIdentityId: `authid_${faker.string.alphanumeric(32)}`,
    entityId: faker.internet.email(),
    entityType: 'email',
    codeProvider: 'otp',
    requestedAt: new Date(),
    providerMetadata: null,
    ...overrides,
  }
}

export function generateUpdateAuthVerificationDTO(
  overrides?: Partial<UpdateAuthVerificationDTO>,
): UpdateAuthVerificationDTO {
  return {
    verifiedAt: new Date(),
    ...overrides,
  }
}

export function generateAuthVerificationDTO(overrides?: Partial<AuthVerificationDTO>): AuthVerificationDTO {
  return {
    id: `authver_${faker.string.alphanumeric(32)}`,
    authIdentityId: `authid_${faker.string.alphanumeric(32)}`,
    entityId: faker.internet.email(),
    entityType: 'email',
    codeProvider: 'otp',
    verifiedAt: null,
    requestedAt: faker.date.recent(),
    providerMetadata: null,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    deletedAt: null,
    ...overrides,
  }
}

// --- AuthPasswordResetToken ---

export function generateCreateAuthPasswordResetTokenDTO(
  overrides?: Partial<CreateAuthPasswordResetTokenDTO>,
): CreateAuthPasswordResetTokenDTO {
  return {
    authIdentityId: `authid_${faker.string.alphanumeric(32)}`,
    providerIdentityId: `provid_${faker.string.alphanumeric(32)}`,
    entityId: faker.internet.email(),
    tokenHash: faker.string.alphanumeric(64),
    expiresAt: new Date(Date.now() + 3600_000),
    ...overrides,
  }
}

export function generateAuthPasswordResetTokenDTO(
  overrides?: Partial<AuthPasswordResetTokenDTO>,
): AuthPasswordResetTokenDTO {
  return {
    id: `authprt_${faker.string.alphanumeric(32)}`,
    authIdentityId: `authid_${faker.string.alphanumeric(32)}`,
    providerIdentityId: `provid_${faker.string.alphanumeric(32)}`,
    entityId: faker.internet.email(),
    tokenHash: faker.string.alphanumeric(64),
    expiresAt: new Date(Date.now() + 3600_000),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}
