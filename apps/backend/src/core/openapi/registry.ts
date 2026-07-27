import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi'

export function createRegistry() {
  return new OpenAPIRegistry()
}

export function generateDocument(registry: OpenAPIRegistry, title: string) {
  const generator = new OpenApiGeneratorV31(registry.definitions)
  return generator.generateDocument({
    openapi: '3.1.0',
    info: { title, version: '0.1.0' },
    servers: [{ url: 'http://localhost:3000' }],
  })
}
