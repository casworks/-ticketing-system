const express = require("express");
const { read, write, nextId } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const FIELD_TYPES = ["text", "number", "dropdown", "checkbox", "date"];

// GET /api/custom-fields  (optionally ?category=hardware)
router.get("/", requireAuth, (req, res) => {
  const data = read();
  const { category } = req.query;
  const fields = category
    ? data.customFields.filter((f) => f.applies_to_category === category || f.applies_to_category === "all")
    : data.customFields;
  res.json(fields);
});

// POST /api/custom-fields  (admin builds custom field without touching code)
router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const { name, label, field_type, options, applies_to_category, required } = req.body;
  if (!name || !label || !field_type) {
    return res.status(400).json({ error: "name, label and field_type are required" });
  }
  if (!FIELD_TYPES.includes(field_type)) {
    return res.status(400).json({ error: `field_type must be one of ${FIELD_TYPES.join(", ")}` });
  }
  const data = read();
  const field = {
    id: nextId(data, "customFields"),
    name,
    label,
    field_type,
    options: Array.isArray(options) ? options : [],
    applies_to_category: applies_to_category || "all",
    required: Boolean(required)
  };
  data.customFields.push(field);
  write(data);
  res.status(201).json(field);
});

// PUT /api/custom-fields/:id
router.put("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const data = read();
  const field = data.customFields.find((f) => f.id === Number(req.params.id));
  if (!field) return res.status(404).json({ error: "Custom field not found" });
  Object.assign(field, req.body, { id: field.id });
  write(data);
  res.json(field);
});

// DELETE /api/custom-fields/:id
router.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const data = read();
  const before = data.customFields.length;
  data.customFields = data.customFields.filter((f) => f.id !== Number(req.params.id));
  if (data.customFields.length === before) return res.status(404).json({ error: "Custom field not found" });
  write(data);
  res.status(204).end();
});

module.exports = router;
