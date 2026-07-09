const crypto = require("crypto");
const { read } = require("../db");

// Stateless signed tokens — required on serverless hosts (Vercel) where each
// request can land on a different instance, so an in-memory session store
// doesn't survive between requests. Demo-only auth: secret has a fixed
// fallback, so set AUTH_SECRET in production if this ever handles real data.
const SECRET = process.env.AUTH_SECRET || "fresh-ticketing-demo-secret";
const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

function issueToken(user) {
  const expires = Date.now() + TTL_MS;
  const payload = `${user.id}.${expires}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

function verifyToken(token) {
  let decoded;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf-8");
  } catch {
    return null;
  }
  const [userId, expires, signature] = decoded.split(".");
  if (!userId || !expires || !signature) return null;
  if (sign(`${userId}.${expires}`) !== signature) return null;
  if (Date.now() > Number(expires)) return null;
  return Number(userId);
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const userId = token && verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: missing or invalid token" });
  }
  const data = read();
  const user = data.users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ error: "Unauthorized: user not found" });
  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: requires role ${roles.join(" or ")}` });
    }
    next();
  };
}

module.exports = { issueToken, requireAuth, requireRole };
