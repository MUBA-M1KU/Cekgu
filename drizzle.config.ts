import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  // Both the Better Auth generated tables and the record tables from TRD section 11.
  schema: './src/server/db/*schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' }
})
