import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerOpenApiRoute } from '../src/core/openapi/register-route.js'
import { createRegistry, generateDocument } from '../src/core/openapi/registry.js'
import { allDefinitions } from '../src/routes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function isAdminRoute(matcher: string) {
  return matcher.startsWith('/admin/') || matcher.startsWith('/auth/')
}

function isStoreRoute(matcher: string) {
  return matcher.startsWith('/store/') || matcher.startsWith('/auth/')
}

// Admin API
const adminRegistry = createRegistry()
for (const definition of allDefinitions.filter((d) => isAdminRoute(d.matcher))) {
  registerOpenApiRoute(adminRegistry, definition.matcher, definition)
}

const adminDoc = generateDocument(adminRegistry, 'Admin API')
const adminPath = resolve(__dirname, '../openapi/openapi-admin.json')
writeFileSync(adminPath, `${JSON.stringify(adminDoc, null, 2)}\n`)
console.info(`Admin OpenAPI spec written to ${adminPath}`)

// Store API
const storeRegistry = createRegistry()
for (const definition of allDefinitions.filter((d) => isStoreRoute(d.matcher))) {
  registerOpenApiRoute(storeRegistry, definition.matcher, definition)
}

const storeDoc = generateDocument(storeRegistry, 'Store API')
const storePath = resolve(__dirname, '../openapi/openapi-store.json')
writeFileSync(storePath, `${JSON.stringify(storeDoc, null, 2)}\n`)
console.info(`Store OpenAPI spec written to ${storePath}`)
