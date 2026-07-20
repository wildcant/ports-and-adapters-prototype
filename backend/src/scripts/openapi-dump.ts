import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import customerMiddlewares from '../api/customers/middlewares.js'
import { registerOpenApiRoutes } from '../core/openapi/register-route.js'
import { generateDocument } from '../core/openapi/registry.js'

registerOpenApiRoutes(customerMiddlewares)

const doc = generateDocument()
const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(__dirname, '../../../openapi.json')
writeFileSync(outPath, `${JSON.stringify(doc, null, 2)}\n`)
console.log(`OpenAPI spec written to ${outPath}`)
