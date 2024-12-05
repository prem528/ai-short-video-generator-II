import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./configs/schema.js",
  dbCredentials: {
    url: "postgresql://ai-short-video-generator_owner:h8LRWHXul7TO@ep-withered-hall-a1n8bwfm.ap-southeast-1.aws.neon.tech/ai-short-video-generator?sslmode=require",
  },
});
