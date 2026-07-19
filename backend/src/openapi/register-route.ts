import type { RouteConfig } from '@asteasolutions/zod-to-openapi'
import type { MiddlewareRoute } from '../core/middleware/types.js'
import { registry } from './registry.js'

const methodMap = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
} as const

export function registerOpenApiRoute(routePath: string, config: MiddlewareRoute) {
  const method = methodMap[config.method]
  const openApiPath = routePath.replace(/:(\w+)/g, '{$1}')

  const request: RouteConfig['request'] = {}

  if (config.paramsSchema) {
    request.params = config.paramsSchema as unknown as NonNullable<RouteConfig['request']>['params']
  }
  if (config.querySchema) {
    request.query = config.querySchema as unknown as NonNullable<RouteConfig['request']>['query']
  }
  if (config.bodySchema) {
    request.body = {
      content: { 'application/json': { schema: config.bodySchema } },
    }
  }

  const hasParams = config.paramsSchema != null
  const responses: RouteConfig['responses'] = {
    200: {
      description: 'Successful response',
      ...(config.responseSchema ? { content: { 'application/json': { schema: config.responseSchema } } } : {}),
    },
    400: { description: 'Validation error' },
  }

  if (hasParams) {
    responses[404] = { description: 'Not found' }
  }

  const routeConfig: RouteConfig = {
    method,
    path: openApiPath,
    summary: config.summary,
    description: config.description,
    tags: config.tags,
    request,
    responses,
  }

  registry.registerPath(routeConfig)
}
