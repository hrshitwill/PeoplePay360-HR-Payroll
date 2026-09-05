const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Import route handlers
const employeeRoutes = require("./routes/employeeRoutes");
const contractRoutes = require("./routes/contractRoutes");
const workingScheduleRoutes = require("./routes/workingScheduleRoutes");
const timeOffRoutes = require("./routes/timeOffRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const salaryRuleRoutes = require("./routes/salaryRuleRoutes");
const salaryStructureRoutes = require("./routes/salaryStructureRoutes");
const payrunRoutes = require("./routes/payrunRoutes");
const payslipRoutes = require("./routes/payslipRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const seedRoutes = require("./routes/seedRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Connect MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
});

// API Endpoints
app.use("/api/employees", employeeRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/schedules", workingScheduleRoutes);
app.use("/api/timeoff", timeOffRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/salary-rules", salaryRuleRoutes);
app.use("/api/salary-structures", salaryStructureRoutes);
app.use("/api/payruns", payrunRoutes);
app.use("/api/payslips", payslipRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "PeoplePay360 HR & Payroll backend is running smoothly",
        timestamp: new Date()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err.stack);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`PeoplePay360 backend running on port ${PORT} (0.0.0.0)`);
});