const express = require("express");
const { read, write, nextId } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { CATEGORIES, PRIORITIES, canTransition } = require("../workflow");

const router = express.Router();

// GET /api/tickets?status=&category=&assigned_to=&priority=
router.get("/", requireAuth, (req, res) => {
  const data = read();
  let tickets = data.tickets;
  const { status, category, assigned_to, priority } = req.query;

  if (req.user.role === "customer") {
    tickets = tickets.filter((t) => t.created_by === req.user.id);
  } else if (req.user.role === "agent") {
    // agents see everything unassigned + their own, so they can pick up new work
    tickets = tickets.filter((t) => t.assigned_to === req.user.id || t.assigned_to === null);
  }

  if (status) tickets = tickets.filter((t) => t.status === status);
  if (category) tickets = tickets.filter((t) => t.category === category);
  if (assigned_to) tickets = tickets.filter((t) => t.assigned_to === Number(assigned_to));
  if (priority) tickets = tickets.filter((t) => t.priority === priority);

  res.json(tickets);
});

// GET /api/tickets/:id
router.get("/:id", requireAuth, (req, res) => {
  const data = read();
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const comments = data.comments.filter((c) => c.ticket_id === ticket.id);
  const workLogs = data.workLogs.filter((w) => w.ticket_id === ticket.id);
  res.json({ ...ticket, comments, workLogs });
});

// POST /api/tickets
router.post("/", requireAuth, (req, res) => {
  const { title, description, category, priority, custom_values } = req.body;
  if (!title || !description || !category) {
    return res.status(400).json({ error: "title, description and category are required" });
  }
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of ${CATEGORIES.join(", ")}` });
  }
  const chosenPriority = priority || "medium";
  if (!PRIORITIES.includes(chosenPriority)) {
    return res.status(400).json({ error: `priority must be one of ${PRIORITIES.join(", ")}` });
  }

  const data = read();

  // Validate required custom fields for this category
  const applicableFields = data.customFields.filter(
    (f) => f.applies_to_category === category || f.applies_to_category === "all"
  );
  for (const field of applicableFields) {
    if (field.required && !(custom_values && custom_values[field.name])) {
      return res.status(400).json({ error: `Custom field "${field.label}" is required` });
    }
  }

  const now = new Date().toISOString();
  const ticket = {
    id: nextId(data, "tickets"),
    title,
    description,
    category,
    priority: chosenPriority,
    status: "new",
    created_by: req.user.id,
    assigned_to: null,
    remote_tool: null,
    remote_session_link: null,
    custom_values: custom_values || {},
    created_at: now,
    updated_at: now,
    resolved_at: null,
    history: [{ status: "new", at: now, by: req.user.id }]
  };
  data.tickets.push(ticket);
  write(data);
  res.status(201).json(ticket);
});

// PATCH /api/tickets/:id  — update status (workflow-enforced), assignment, remote tool link, custom fields
router.patch("/:id", requireAuth, (req, res) => {
  const data = read();
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const { status, assigned_to, remote_tool, remote_session_link, priority, custom_values } = req.body;

  if (status && status !== ticket.status) {
    if (!canTransition(ticket.status, status)) {
      return res.status(400).json({
        error: `Invalid workflow transition: ${ticket.status} -> ${status}`
      });
    }
    ticket.status = status;
    ticket.history.push({ status, at: new Date().toISOString(), by: req.user.id });
    if (status === "resolved") ticket.resolved_at = new Date().toISOString();
  }

  if (assigned_to !== undefined) ticket.assigned_to = assigned_to;
  if (remote_tool !== undefined) ticket.remote_tool = remote_tool;
  if (remote_session_link !== undefined) ticket.remote_session_link = remote_session_link;
  if (priority !== undefined) {
    if (!PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `priority must be one of ${PRIORITIES.join(", ")}` });
    }
    ticket.priority = priority;
  }
  if (custom_values !== undefined) ticket.custom_values = { ...ticket.custom_values, ...custom_values };

  ticket.updated_at = new Date().toISOString();
  write(data);
  res.json(ticket);
});

// POST /api/tickets/:id/comments
router.post("/:id/comments", requireAuth, (req, res) => {
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: "comment is required" });

  const data = read();
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const entry = {
    id: ++data.seq.comments,
    ticket_id: ticket.id,
    user_id: req.user.id,
    comment,
    created_at: new Date().toISOString()
  };
  data.comments.push(entry);
  write(data);
  res.status(201).json(entry);
});

// POST /api/tickets/:id/worklog  — agent logs time spent (feeds payroll)
router.post("/:id/worklog", requireAuth, (req, res) => {
  const { minutes_spent, note } = req.body;
  if (!minutes_spent || minutes_spent <= 0) {
    return res.status(400).json({ error: "minutes_spent must be a positive number" });
  }

  const data = read();
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const entry = {
    id: ++data.seq.workLogs,
    ticket_id: ticket.id,
    agent_id: req.user.id,
    minutes_spent,
    note: note || "",
    created_at: new Date().toISOString()
  };
  data.workLogs.push(entry);
  write(data);
  res.status(201).json(entry);
});

module.exports = router;
