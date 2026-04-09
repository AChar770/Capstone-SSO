import { verifyToken } from "../utils/jwt.js";
import db from "../db/client.js";

export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next();
  }

  const token = authorization.split(" ")[1];

  try {
    const payload = verifyToken(token);
    const result = await db.query(
      "SELECT id, username, email, created_at FROM users WHERE id = $1;",
      [payload.id]
    );

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}
