import { defineConfig } from 'orval'

const pascal = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export default defineConfig({
  api: {
    input: {
      target: '../openapi.json',
    },
    output: {
      target: 'src/api/generated',
      schemas: 'src/api/generated/model',
      client: 'fetch',
      mode: 'tags-split',
      baseUrl: 'http://localhost:3000',
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
