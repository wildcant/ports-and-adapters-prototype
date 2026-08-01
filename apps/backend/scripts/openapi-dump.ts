import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import customerMiddlewares from '../src/api/admin/customers/middlewares.js'
import fulfillmentProvidersMiddlewares from '../src/api/admin/fulfillment-providers/middlewares.js'
import fulfillmentSetsMiddlewares from '../src/api/admin/fulfillment-sets/middlewares.js'
import paymentCollectionMiddlewares from '../src/api/admin/payment-collections/middlewares.js'
import paymentMiddlewares from '../src/api/admin/payments/middlewares.js'
import productMiddlewares from '../src/api/admin/products/middlewares.js'
import refundReasonMiddlewares from '../src/api/admin/refund-reasons/middlewares.js'
import shippingOptionsMiddlewares from '../src/api/admin/shipping-options/middlewares.js'
import shippingProfilesMiddlewares from '../src/api/admin/shipping-profiles/middlewares.js'
import userMiddlewares from '../src/api/admin/users/middlewares.js'
import storeCartMiddlewares from '../src/api/store/carts/middlewares.js'
import storePaymentCollectionMiddlewares from '../src/api/store/payment-collections/middlewares.js'
import storePaymentProviderMiddlewares from '../src/api/store/payment-providers/middlewares.js'
import storeProductMiddlewares from '../src/api/store/products/middlewares.js'
import { registerOpenApiRoutes } from '../src/core/openapi/register-route.js'
import { createRegistry, generateDocument } from '../src/core/openapi/registry.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Admin API
const adminRegistry = createRegistry()
registerOpenApiRoutes(adminRegistry, customerMiddlewares)
registerOpenApiRoutes(adminRegistry, fulfillmentProvidersMiddlewares)
registerOpenApiRoutes(adminRegistry, fulfillmentSetsMiddlewares)
registerOpenApiRoutes(adminRegistry, paymentCollectionMiddlewares)
registerOpenApiRoutes(adminRegistry, paymentMiddlewares)
registerOpenApiRoutes(adminRegistry, productMiddlewares)
registerOpenApiRoutes(adminRegistry, refundReasonMiddlewares)
registerOpenApiRoutes(adminRegistry, shippingOptionsMiddlewares)
registerOpenApiRoutes(adminRegistry, shippingProfilesMiddlewares)
registerOpenApiRoutes(adminRegistry, userMiddlewares)

const adminDoc = generateDocument(adminRegistry, 'Admin API')
const adminPath = resolve(__dirname, '../openapi/openapi-admin.json')
writeFileSync(adminPath, `${JSON.stringify(adminDoc, null, 2)}\n`)
console.log(`Admin OpenAPI spec written to ${adminPath}`)

// Store API
const storeRegistry = createRegistry()
registerOpenApiRoutes(storeRegistry, storeCartMiddlewares)
registerOpenApiRoutes(storeRegistry, storePaymentCollectionMiddlewares)
registerOpenApiRoutes(storeRegistry, storePaymentProviderMiddlewares)
registerOpenApiRoutes(storeRegistry, storeProductMiddlewares)

const storeDoc = generateDocument(storeRegistry, 'Store API')
const storePath = resolve(__dirname, '../openapi/openapi-store.json')
writeFileSync(storePath, `${JSON.stringify(storeDoc, null, 2)}\n`)
console.log(`Store OpenAPI spec written to ${storePath}`)
