import { verifyToken } from "../utils/jwt.js";
import db from "../db/client.js";

export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next();
  }

  const token = authorization.split(" ")[1];
  let payload;

  try {
    // WHY (Functionality): Token verification is handled first so invalid auth is reported clearly as 401 before any database work happens.
    payload = verifyToken(token);
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const result = await db.query(
      "SELECT id, first_name, last_name, username, email, created_at FROM users WHERE id = $1;",
      [payload.id],
    );

    req.user = result.rows[0];
    next();
  } catch (error) {
    // WHY (Functionality): Passing database errors to Express error handling avoids masking server problems as token problems.
    next(error);
  }
}
