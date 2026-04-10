import "dotenv/config";
import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.js";
import db from "./db/client.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Secret Santa Organizer API");
});

app.use("/api/auth", authRouter);

async function seed(req, res, next) {
  try {
    await db.query(
      "CREATE TABLE IF NOT EXISTS greetings (id SERIAL PRIMARY KEY, message TEXT NOT NULL);"
    );
    await db.query(
      "INSERT INTO greetings (message) SELECT 'Hello World from the database!' WHERE NOT EXISTS (SELECT 1 FROM greetings);"
    );
    res.send("database seeded");
  } catch (error) {
    next(error);
  }
}

async function helloWorld(req, res, next) {
  try {
    const result = await db.query("SELECT message FROM greetings LIMIT 1;");
    res.json({ greeting: result.rows[0].message });
  } catch (error) {
    next(error);
  }
}

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
