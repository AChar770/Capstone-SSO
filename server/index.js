import "dotenv/config";
import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.js";
import eventsRouter from "./routes/events.js";

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
app.use("/api/events", eventsRouter);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
