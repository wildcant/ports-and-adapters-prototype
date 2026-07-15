import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./modules/identity/adapters/drizzle/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./dev.db",
  },
})
