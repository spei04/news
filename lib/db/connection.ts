import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

let cached:
  | {
      sql: postgres.Sql;
      db: ReturnType<typeof drizzle>;
    }
  | undefined;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  if (!cached) {
    const sql = postgres(url, { prepare: false, max: 2 });
    cached = { sql, db: drizzle(sql) };
  }
  return cached.db;
}
