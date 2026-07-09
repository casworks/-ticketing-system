const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./src/routes/auth");
const ticketRoutes = require("./src/routes/tickets");
const customFieldRoutes = require("./src/routes/customFields");
const payrollRoutes = require("./src/routes/payroll");
const userRoutes = require("./src/routes/users");

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/custom-fields", customFieldRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/users", userRoutes);

app.use(express.static(path.join(__dirname, "public")));

// Vercel imports this file as a serverless function and calls the exported
// app directly — it must not also bind a port. Only listen when run
// directly (local dev, Render, or any plain Node host).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Fresh Ticketing System running at http://localhost:${PORT}`);
  });
}

module.exports = app;
