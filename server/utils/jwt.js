import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  // WHY (Functionality): Failing fast with a clear message makes authentication setup issues obvious during startup instead of surfacing as confusing runtime route errors.
  throw new Error("JWT_SECRET is required to sign and verify auth tokens.");
}

export function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
