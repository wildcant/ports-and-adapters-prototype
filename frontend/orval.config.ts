import { defineConfig } from 'orval'

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
    },
  },
})
