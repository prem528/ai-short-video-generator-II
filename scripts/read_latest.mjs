import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const dbUrl = process.env.NEXT_PUBLIC_DRIZZLE_DATABASE_URL || process.env.DRIZZLE_DATABASE_URL;
const sql = neon(dbUrl);

async function main() {
  try {
    const res = await sql`
      SELECT id, title, "finalVideoUrl", (script->>'finalVideoUrl') as script_url 
      FROM "videoData" 
      ORDER BY id DESC 
      LIMIT 5;
    `;
    console.log("Latest Videos in DB:", res);
  } catch (err) {
    console.error("Error reading database:", err);
  }
}

main();
