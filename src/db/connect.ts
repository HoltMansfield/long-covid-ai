import { drizzle } from "drizzle-orm/node-postgres";
import dbE2E from "./connect-e2e";
import dbWeb from "./connect-web";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

let db: NodePgDatabase<typeof schema>;

if (process.env.APP_ENV === "E2E") {
  if (!dbE2E) throw new Error("dbE2E is not configured!");
  db = dbE2E;
} else {
  if (!dbWeb) throw new Error("dbWeb is not configured!");
  db = dbWeb;
}

export { db };
