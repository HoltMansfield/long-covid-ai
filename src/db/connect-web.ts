import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { env } from "@/env";

let db: NodePgDatabase<typeof schema> | null = null;

if (env.APP_ENV !== "E2E") {
  const pool = new Pool({ connectionString: env.DB_URL });
  db = drizzle(pool, { schema });
}

export default db;
