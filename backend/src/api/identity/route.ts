import type { CreateUserInput, IdentityService } from '../../modules/identity/ports.js'
import type { HttpRequest, HttpResult } from '../../server/ports.js'

export const GET = async (req: HttpRequest): Promise<HttpResult> => {
  const identityService = req.scope.resolve<IdentityService>('identityService')
  const users = await identityService.listUsers()
  return { status: 200, json: { users } }
}

export const POST = async (req: HttpRequest<CreateUserInput>): Promise<HttpResult> => {
  const identityService = req.scope.resolve<IdentityService>('identityService')
  try {
    const user = await identityService.createUser(req.body)
    return { status: 201, json: { user } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { status: 400, json: { error: message } }
  }
}
