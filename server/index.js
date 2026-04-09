import "dotenv/config";
import cors from "cors";
import express from "express";
import db from "./db/client.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Hello World</title>
      </head>
      <body>
        <h1>Secret Santa Organizer</h1>
        <p id="message">Loading greeting...</p>

        <script>
          fetch("/greet")
            .then((response) => response.json())
            .then((data) => {
              document.getElementById("message").textContent = data.greeting;
            })
            .catch(() => {
              document.getElementById("message").textContent =
                "Could not load greeting from the database.";
            });
        </script>
      </body>
    </html>
  `);
});

app.get("/greet", helloWorld);

app.get("/seed", seed);

async function seed(req, res) {
  await db.query(
    "CREATE TABLE IF NOT EXISTS greetings (id SERIAL PRIMARY KEY, message TEXT NOT NULL);",
  );
  await db.query(
    "INSERT INTO greetings (message) SELECT 'Hello World from the database!' WHERE NOT EXISTS (SELECT 1 FROM greetings);",
  );
  res.send("database seeded");
}

async function helloWorld(req, res) {
  try {
    const result = await db.query("SELECT message FROM greetings LIMIT 1;");
    res.json({ greeting: result.rows[0].message });
  } catch (error) {
    console.error(error);
    res.json({ greeting: "Something went wrong" });
  }
}

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
