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

app.listen(PORT, () => {
  console.log(`Fresh Ticketing System running at http://localhost:${PORT}`);
});
