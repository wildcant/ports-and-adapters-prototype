import './setup.js'
import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi'

export const registry = new OpenAPIRegistry()

export function generateDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions)
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Ports & Adapters API',
      version: '0.1.0',
    },
    servers: [{ url: 'http://localhost:3000' }],
  })
}
