const express = require("express");
const { read } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/payroll/summary?agent_id=&from=&to=
// Computes payable amount per agent based on logged minutes x hourly_rate.
router.get("/summary", requireAuth, requireRole("admin"), (req, res) => {
  const data = read();
  const { agent_id, from, to } = req.query;

  let logs = data.workLogs;
  if (agent_id) logs = logs.filter((l) => l.agent_id === Number(agent_id));
  if (from) logs = logs.filter((l) => l.created_at >= from);
  if (to) logs = logs.filter((l) => l.created_at <= to);

  const byAgent = {};
  for (const log of logs) {
    if (!byAgent[log.agent_id]) byAgent[log.agent_id] = { minutes: 0, entries: 0 };
    byAgent[log.agent_id].minutes += log.minutes_spent;
    byAgent[log.agent_id].entries += 1;
  }

  const summary = Object.entries(byAgent).map(([agentId, agg]) => {
    const agent = data.users.find((u) => u.id === Number(agentId));
    const hours = agg.minutes / 60;
    const rate = agent ? agent.hourly_rate : 0;
    return {
      agent_id: Number(agentId),
      agent_name: agent ? agent.name : "Unknown",
      total_minutes: agg.minutes,
      total_hours: Number(hours.toFixed(2)),
      hourly_rate: rate,
      entries: agg.entries,
      payable_amount: Number((hours * rate).toFixed(2))
    };
  });

  res.json(summary);
});

// GET /api/payroll/agents
router.get("/agents", requireAuth, requireRole("admin"), (req, res) => {
  const data = read();
  const agents = data.users
    .filter((u) => u.role === "agent")
    .map(({ password, ...safe }) => safe);
  res.json(agents);
});

module.exports = router;
