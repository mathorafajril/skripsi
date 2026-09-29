// backend/db/index.js
// PostgreSQL connection pool using pg.
// Pool is used instead of a single client — it reuses connections efficiently
// and handles reconnects automatically.

import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true"
    ? { rejectUnauthorized: true }  // enforce SSL in production
    : false,
  max: 10,              // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Database connected successfully.");
    release();
  }
});

export default pool;
