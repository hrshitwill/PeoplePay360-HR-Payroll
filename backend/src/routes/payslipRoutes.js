const express = require("express");
const {
    getPayslips,
    getPayslipById,
    getEmployeePayslips,
    getPayslipPDF
} = require("../controllers/payslipController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(auth);

// Employee endpoints
router.get("/employee/:employeeId", getEmployeePayslips);
router.get("/:id/pdf", getPayslipPDF);
router.get("/:id", getPayslipById); // Employees can view their own

// Payroll/Admin endpoints
router.get("/", authorize("ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getPayslips);

module.exports = router;