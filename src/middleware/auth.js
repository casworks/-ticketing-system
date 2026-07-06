const { read } = require("../db");

// In-memory session tokens (demo/teaching auth — resets on server restart)
const tokens = new Map();

function issueToken(user) {
  const token = `${user.id}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
  tokens.set(token, user.id);
  return token;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: "Unauthorized: missing or invalid token" });
  }
  const userId = tokens.get(token);
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

module.exports = { tokens, issueToken, requireAuth, requireRole };
