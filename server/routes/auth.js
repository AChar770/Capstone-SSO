import express from "express";
import bcrypt from "bcrypt";
import db from "../db/client.js";
import { createToken } from "../utils/jwt.js";
import getUserFromToken from "../middleware/getUserFromToken.js";
import requireUser from "../middleware/requireUser.js";

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  // WHY (Functionality): Normalizing email input makes login/register behavior reliable for normal user input like extra spaces or uppercase letters.
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    // WHY (Functionality): Separate required-field checks from email-format checks so the route never crashes on missing email and returns clear feedback.
    if (!firstName || !lastName || !password || !normalizedEmail) {
      return res.status(400).json({
        error:
          "First name, last name, email address, and password are required",
      });
    }

    // WHY (Functionality): Explicit format validation protects the main register flow from invalid data before database writes.
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }

    const username = normalizedEmail;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, username, email, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, username, email, created_at;`,
      [firstName, lastName, username, normalizedEmail, hashedPassword],
    );

    const user = result.rows[0];
    const token = createToken({ id: user.id, username: user.username });

    res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }

    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    // WHY (Functionality): Matching login input normalization to register input prevents valid users from being blocked by casing/spacing differences.
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // WHY (Code Style): Selecting only needed columns keeps auth queries easier to read and avoids carrying extra data through the route.
    const result = await db.query(
      `SELECT id, first_name, last_name, username, email, password, created_at
       FROM users
       WHERE email = $1;`,
      [normalizedEmail],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken({ id: user.id, username: user.username });

    res.json({
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", getUserFromToken, requireUser, (req, res) => {
  res.json(req.user);
});

export default router;
