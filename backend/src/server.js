const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const employeeRoutes = require("./routes/employeeRoutes");
const contractRoutes = require("./routes/contractRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const salaryStructureRoutes = require("./routes/salaryStructureRoutes");
const salaryRuleRoutes = require("./routes/salaryRuleRoutes");
const payrunRoutes = require("./routes/payrunRoutes");
const payslipRoutes = require("./routes/payslipRoutes");
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "PeoplePay360 backend is running"
    });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/salary-structures", salaryStructureRoutes);
app.use("/api/salary-rules", salaryRuleRoutes);
app.use("/api/payruns", payrunRoutes);
app.use("/api/payslips", payslipRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});