import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@tests': resolve(__dirname, './tests'),
      '@core': resolve(__dirname, './src/core'),
    },
  },
  test: {
    include: ['./src/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup/setup-test-env.ts'],
    fileParallelism: false,
    restoreMocks: true,
    coverage: {
      include: ['src/**/*.{ts}'],
    },
  },
})
