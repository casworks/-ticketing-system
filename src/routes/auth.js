const express = require("express");
const { read } = require("../db");
const { issueToken } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const data = read();
  const user = data.users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = issueToken(user);
  const { password: _pw, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

module.exports = router;
