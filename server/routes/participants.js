import express from "express";
import db from "../db/client.js";
import getUserFromToken from "../middleware/getUserFromToken.js";
import requireUser from "../middleware/requireUser.js";

const router = express.Router();

router.use(getUserFromToken);
router.use(requireUser);

router.post("/events/:eventId/participants", async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { displayName, userId } = req.body || {};

    if (!displayName) {
      return res.status(400).json({ error: "Display name is required" });
    }

    const eventResult = await db.query(
      "SELECT * FROM events WHERE id = $1 AND organizer_id = $2;",
      [eventId, req.user.id]
    );

    const event = eventResult.rows[0];

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const result = await db.query(
      `INSERT INTO participants (event_id, user_id, display_name)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [eventId, userId || null, displayName]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get("/events/:eventId/participants", async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const eventResult = await db.query(
      "SELECT * FROM events WHERE id = $1 AND organizer_id = $2;",
      [eventId, req.user.id]
    );

    const event = eventResult.rows[0];

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const result = await db.query(
      `SELECT * FROM participants
       WHERE event_id = $1
       ORDER BY joined_at DESC;`,
      [eventId]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.delete("/participants/:participantId", async (req, res, next) => {
  try {
    const { participantId } = req.params;

    const result = await db.query(
      `DELETE FROM participants
       WHERE id = $1
       AND event_id IN (
         SELECT id FROM events WHERE organizer_id = $2
       )
       RETURNING *;`,
      [participantId, req.user.id]
    );

    const participant = result.rows[0];

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({ message: "Participant deleted", participant });
  } catch (error) {
    next(error);
  }
});

export default router;
