import { Pool } from "pg";

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 15,                     // increased from 5 — prevents queuing under concurrent load
  idleTimeoutMillis: 30000,    // release idle connections after 30s
  connectionTimeoutMillis: 5000, // fail fast if upstream is unreachable (5s)
  keepAlive: true,             // send TCP keepalives so idle connections survive NAT/proxy resets
  keepAliveInitialDelayMillis: 10000,
  allowExitOnIdle: true,       // let the process exit cleanly in dev
  ssl: {
    rejectUnauthorized: false,
  },
};

// Prevent multiple instances of Pool in development
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool = globalForDb.pool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;
