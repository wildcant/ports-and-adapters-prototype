import { kdf, verify } from 'scrypt-kdf'

export type ScryptConfig = {
  logN: number
  r: number
  p: number
}

export const DEFAULT_SCRYPT_CONFIG: ScryptConfig = {
  logN: 15,
  r: 8,
  p: 1,
}

export async function hashPassword(password: string, config: ScryptConfig = DEFAULT_SCRYPT_CONFIG): Promise<string> {
  const hash = await kdf(password, config)
  return Buffer.from(hash).toString('base64')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const buf = Buffer.from(hash, 'base64')
  return verify(buf, password)
}
