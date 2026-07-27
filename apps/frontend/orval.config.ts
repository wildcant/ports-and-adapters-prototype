import { defineConfig } from 'orval'

export default defineConfig({
  admin: {
    input: {
      target: '../backend/openapi/openapi-admin.json',
    },
    output: {
      target: 'src/api/generated/admin',
      schemas: 'src/api/generated/admin/model',
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
  store: {
    input: {
      target: '../backend/openapi/openapi-store.json',
    },
    output: {
      target: 'src/api/generated/store',
      schemas: 'src/api/generated/store/model',
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
