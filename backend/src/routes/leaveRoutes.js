const express = require("express");
const {
    createLeave,
    getLeaves,
    getEmployeeLeaves,
    approveLeave,
    rejectLeave,
    getLeaveById
} = require("../controllers/leaveController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(auth);

// Self endpoints
router.post("/", createLeave);
router.get("/employee/:employeeId", getEmployeeLeaves);

// HR/Admin endpoints
router.get("/", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getLeaves);
router.get("/:id", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getLeaveById);
router.put("/:id/approve", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), approveLeave);
router.put("/:id/reject", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), rejectLeave);

module.exports = router;