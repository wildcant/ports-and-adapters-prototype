import type { HttpRequest, HttpResult } from "../../../server/ports.js"
import type { IdentityService } from "../../../modules/identity/ports.js"

export const GET = async (req: HttpRequest): Promise<HttpResult> => {
  const identityService = req.scope.resolve<IdentityService>("identityService")
  try {
    const user = await identityService.getUser(req.params.id)
    return { status: 200, json: { user } }
  } catch (err: any) {
    return { status: 404, json: { error: err.message } }
  }
}

export const PATCH = async (req: HttpRequest): Promise<HttpResult> => {
  const identityService = req.scope.resolve<IdentityService>("identityService")
  try {
    const user = await identityService.updateUser(req.params.id, req.body)
    return { status: 200, json: { user } }
  } catch (err: any) {
    return { status: 404, json: { error: err.message } }
  }
}

export const DELETE = async (req: HttpRequest): Promise<HttpResult> => {
  const identityService = req.scope.resolve<IdentityService>("identityService")
  try {
    const result = await identityService.deleteUser(req.params.id)
    return { status: 200, json: result }
  } catch (err: any) {
    return { status: 404, json: { error: err.message } }
  }
}
