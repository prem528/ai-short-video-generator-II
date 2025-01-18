import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./configs/schema.js",
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DRIZZLE_DATABASE_URL,
  },
});
