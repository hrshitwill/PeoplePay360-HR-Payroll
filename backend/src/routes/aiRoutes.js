const express = require("express");
const {
    explainPayslip,
    detectAnomalies,
    simulatePayroll
} = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Explain Payslip endpoint (Available to all authenticated users for their payslips)
router.get("/explain-payslip/:id", explainPayslip);

// AI Anomaly Detection endpoint (Available to Admin, HR & Payroll Managers/Users)
router.get("/anomalies", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER", "EMPLOYEE"), detectAnomalies);

// Payroll Simulation endpoint (Available to Admin, HR & Payroll Managers/Users)
router.post("/simulate", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER", "EMPLOYEE"), simulatePayroll);

module.exports = router;
