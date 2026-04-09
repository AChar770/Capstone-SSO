import "dotenv/config";
import { readFile } from "node:fs/promises";
import db from "./client.js";

const SQL = await readFile(new URL("./schema.sql", import.meta.url), "utf8");

try {
  await db.query(SQL);
  console.log("schema loaded");
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await db.end();
}
