import { defineConfig } from 'orval'

export default defineConfig({
  store: {
    input: {
      target: '../backend/openapi/openapi-store.json',
    },
    output: {
      target: 'src/api/generated',
      schemas: 'src/api/generated/model',
      client: 'axios-functions',
      mode: 'tags-split',
      clean: true,
      override: {
        mutator: {
          path: './src/api/fetcher.ts',
          name: 'fetcher',
        },
      },
    },
  },
})
