import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/modules/identity/adapters/supabase/schema.ts",
  out: "./drizzle-supabase",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SUPABASE_DATABASE_URL!,
  },
})
