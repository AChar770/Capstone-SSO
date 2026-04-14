import express from "express";
import bcrypt from "bcrypt";
import db from "../db/client.js";
import { createToken } from "../utils/jwt.js";
import getUserFromToken from "../middleware/getUserFromToken.js";
import requireUser from "../middleware/requireUser.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body || {};

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: "First name, last name, email, and password required"
      });
    }

    const username = email;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, username, email, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, username, email, created_at;`,
      [firstName, lastName, username, email, hashedPassword]
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
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const result = await db.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1;",
      [username]
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
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", getUserFromToken, requireUser, (req, res) => {
  res.json(req.user);
});

export default router;
