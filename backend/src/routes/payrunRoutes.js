const express = require("express");
const {
    createPayrun,
    getPayruns,
    getPayrunById,
    validatePayrun,
    computePayrun,
    getEligibleEmployees,
    markPaid,
    sendPayslips
} = require("../controllers/payrunController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(auth);
// Only payroll roles and admin can access payruns
router.use(authorize("ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"));

router.post("/", createPayrun);
router.get("/", getPayruns);
router.get("/eligible-employees", getEligibleEmployees);
router.post("/:id/compute", computePayrun);
router.get("/:id", getPayrunById);
router.post("/:id/validate", validatePayrun);
router.post("/:id/mark-paid", markPaid);
router.post("/:id/send-payslips", sendPayslips);

module.exports = router;