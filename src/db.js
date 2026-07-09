const fs = require("fs");
const path = require("path");

// Serverless hosts (Vercel) ship a read-only filesystem except /tmp.
const DB_FILE = process.env.VERCEL
  ? path.join("/tmp", "db.json")
  : path.join(__dirname, "data", "db.json");

function defaultData() {
  return {
    seq: { users: 3, tickets: 3, customFields: 3, comments: 0, workLogs: 0 },
    users: [
      { id: 1, name: "Admin User", email: "admin@demo.com", password: "admin123", role: "admin", hourly_rate: 0 },
      { id: 2, name: "Agent Rina", email: "agent@demo.com", password: "agent123", role: "agent", hourly_rate: 50000 },
      { id: 3, name: "Customer Budi", email: "customer@demo.com", password: "customer123", role: "customer", hourly_rate: 0 }
    ],
    tickets: [
      {
        id: 1,
        title: "Laptop won't boot",
        description: "Laptop is completely dead after a Windows update.",
        category: "hardware",
        priority: "high",
        status: "new",
        created_by: 3,
        assigned_to: null,
        remote_tool: null,
        remote_session_link: null,
        custom_values: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resolved_at: null,
        history: [{ status: "new", at: new Date().toISOString(), by: 3 }]
      },
      {
        id: 2,
        title: "Suspected virus / ransomware",
        description: "Files are encrypted, a ransom message appeared.",
        category: "virus",
        priority: "critical",
        status: "assigned",
        created_by: 3,
        assigned_to: 2,
        remote_tool: "AnyDesk",
        remote_session_link: "anydesk:123456789",
        custom_values: { "os_version": "Windows 11" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resolved_at: null,
        history: [
          { status: "new", at: new Date().toISOString(), by: 3 },
          { status: "assigned", at: new Date().toISOString(), by: 1 }
        ]
      }
    ],
    customFields: [
      { id: 1, name: "os_version", label: "OS Version", field_type: "text", options: [], applies_to_category: "software", required: false },
      { id: 2, name: "device_model", label: "Device Model", field_type: "text", options: [], applies_to_category: "hardware", required: false }
    ],
    comments: [],
    workLogs: []
  };
}

function ensureFile() {
  if (!fs.existsSync(path.dirname(DB_FILE))) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData(), null, 2));
  }
}

function read() {
  ensureFile();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function write(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function nextId(data, key) {
  data.seq[key] = (data.seq[key] || 0) + 1;
  return data.seq[key];
}

module.exports = { read, write, nextId, DB_FILE };
