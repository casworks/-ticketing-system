// Ticket workflow state machine — defines valid status transitions.
const TRANSITIONS = {
  new: ["assigned", "closed"],
  assigned: ["in_progress", "new", "closed"],
  in_progress: ["resolved", "assigned"],
  resolved: ["closed", "reopened"],
  closed: ["reopened"],
  reopened: ["assigned", "in_progress"]
};

const CATEGORIES = ["software", "hardware", "virus", "network", "other"];
const PRIORITIES = ["low", "medium", "high", "critical"];

function canTransition(from, to) {
  return Boolean(TRANSITIONS[from] && TRANSITIONS[from].includes(to));
}

module.exports = { TRANSITIONS, CATEGORIES, PRIORITIES, canTransition };
