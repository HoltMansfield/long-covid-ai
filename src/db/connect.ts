import dbWeb from "./connect-web";
import dbE2E from "./connect-e2e";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { env } from "@/env";

let db: NodePgDatabase<typeof schema>;

if (env.APP_ENV === 'E2E') {
  if (!dbE2E) throw new Error("dbE2E is not configured!");
  db = dbE2E;
} else {
  if (!dbWeb) throw new Error("dbWeb is not configured!");
  db = dbWeb;
}

export { db };
