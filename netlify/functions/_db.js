// netlify/functions/_db.js
// Shared PostgreSQL connection for all Netlify Functions
// Uses Neon (https://neon.tech) — free serverless Postgres

const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function query(sql, params = []) {
  const client = await getPool().connect();
  try {
    const res = await client.query(sql, params);
    return res.rows;
  } finally {
    client.release();
  }
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function execute(sql, params = []) {
  const client = await getPool().connect();
  try {
    const res = await client.query(sql, params);
    return res.rowCount;
  } finally {
    client.release();
  }
}

module.exports = { query, queryOne, execute, getPool };
