import type { IdParams } from '../../../core/types/common.js'
import type { IdentityService, UpdateUserInput } from '../../../modules/identity/ports.js'
import type { HttpRequest, HttpResult } from '../../../server/ports.js'

export const GET = async (req: HttpRequest<unknown, IdParams>): Promise<HttpResult> => {
  const identityService = req.scope.resolve<IdentityService>('identityService')
  try {
    const user = await identityService.getUser(req.params.id)
    return { status: 200, json: { user } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { status: 404, json: { error: message } }
  }
}

export const PATCH = async (req: HttpRequest<UpdateUserInput, IdParams>): Promise<HttpResult> => {
  const identityService = req.scope.resolve<IdentityService>('identityService')
  try {
    const user = await identityService.updateUser(req.params.id, req.body)
    return { status: 200, json: { user } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { status: 404, json: { error: message } }
  }
}

export const DELETE = async (req: HttpRequest<unknown, IdParams>): Promise<HttpResult> => {
  const identityService = req.scope.resolve<IdentityService>('identityService')
  try {
    const result = await identityService.deleteUser(req.params.id)
    return { status: 200, json: result }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { status: 404, json: { error: message } }
  }
}
