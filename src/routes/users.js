const express = require("express");
const { read } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/users/me
router.get("/me", requireAuth, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json(safeUser);
});

// GET /api/users?role=agent  — used to populate assignment dropdown
router.get("/", requireAuth, (req, res) => {
  const data = read();
  let users = data.users;
  if (req.query.role) users = users.filter((u) => u.role === req.query.role);
  res.json(users.map(({ password, ...safe }) => safe));
});

module.exports = router;
