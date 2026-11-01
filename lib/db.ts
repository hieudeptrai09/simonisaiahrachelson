import postgres from "postgres";

const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

// Reuse one pool across hot reloads in dev. The pooler URL runs in transaction
// mode, which does not support prepared statements.
export const sql =
  globalForDb.sql ??
  postgres(process.env.SUPABASE_POSTGRES_URL!, { prepare: false, max: 5 });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
