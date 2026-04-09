import pg from "pg";

const db = new pg.Client(
  process.env.DATABASE_URL || "postgresql://localhost:5432/postgres"
);

db.connect();

export default db;
