import type { HttpRequest, HttpResult } from "../../server/ports.js"
import type { IdentityService } from "../../modules/identity/ports.js"

export const GET = async (req: HttpRequest): Promise<HttpResult> => {
  const identityService = req.scope.resolve<IdentityService>("identityService")
  const users = await identityService.listUsers()
  return { status: 200, json: { users } }
}

export const POST = async (req: HttpRequest): Promise<HttpResult> => {
  const identityService = req.scope.resolve<IdentityService>("identityService")
  try {
    const user = await identityService.createUser(req.body)
    return { status: 201, json: { user } }
  } catch (err: any) {
    return { status: 400, json: { error: err.message } }
  }
}
