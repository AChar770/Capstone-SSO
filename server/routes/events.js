import express from "express";
import db from "../db/client.js";
import getUserFromToken from "../middleware/getUserFromToken.js";
import requireUser from "../middleware/requireUser.js";

const router = express.Router();

router.use(getUserFromToken);
router.use(requireUser);

router.post("/", async (req, res, next) => {
  try {
    const { title, description, eventDate, budget } = req.body || {};

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await db.query(
      `INSERT INTO events (organizer_id, title, description, event_date, budget)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [req.user.id, title, description || null, eventDate || null, budget || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM events
       WHERE organizer_id = $1
       ORDER BY created_at DESC;`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
