import type { StoreCartInventoryResponse } from '@proteus/http-schemas/store'
import { confirmInventoryWorkflow } from '@workflows/cart/confirm-inventory-workflow.js'
import type { HttpRequest, HttpResult } from '../../../../../server/ports.js'

type CheckInventoryInput = { params: { id: string } }

export const GET = async (req: HttpRequest<CheckInventoryInput>): Promise<HttpResult<StoreCartInventoryResponse>> => {
  const result = await confirmInventoryWorkflow.run({ cartId: req.params.id })

  return { status: 200, json: result }
}
