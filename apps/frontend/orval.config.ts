import { defineConfig } from 'orval'

const pascal = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export default defineConfig({
  admin: {
    input: {
      target: '../backend/openapi/openapi-admin.json',
    },
    output: {
      target: 'src/api/generated/admin',
      schemas: 'src/api/generated/admin/model',
      client: 'fetch',
      mode: 'tags-split',
      baseUrl: {
        runtime: 'env.VITE_BACKEND_URL',
        imports: [{ name: 'env', importPath: '../../../env' }],
      },
      clean: true,
      override: {
        operationName: (operation) => {
          const operationId = operation.operationId ?? ''
          return [operationId, pascal(operationId)]
        },
      },
    },
  },
  store: {
    input: {
      target: '../backend/openapi/openapi-store.json',
    },
    output: {
      target: 'src/api/generated/store',
      schemas: 'src/api/generated/store/model',
      client: 'fetch',
      mode: 'tags-split',
      baseUrl: {
        runtime: 'env.VITE_BACKEND_URL',
        imports: [{ name: 'env', importPath: '../../../env' }],
      },
      clean: true,
      override: {
        operationName: (operation) => {
          const operationId = operation.operationId ?? ''
          return [operationId, pascal(operationId)]
        },
      },
    },
  },
})
