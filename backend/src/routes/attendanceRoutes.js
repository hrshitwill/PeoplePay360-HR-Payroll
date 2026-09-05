const express = require("express");
const {
    checkIn,
    checkOut,
    getAttendances,
    getEmployeeAttendance,
    createAttendance,
    updateAttendance,
    getAttendanceById
} = require("../controllers/attendanceController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

// Public / Self endpoints (still require auth, but not specific roles)
router.post("/check-in", auth, checkIn);
router.post("/check-out", auth, checkOut);
router.get("/employee/:employeeId", auth, getEmployeeAttendance);

// HR/Admin endpoints
router.get("/", auth, authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getAttendances);
router.get("/:id", auth, authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getAttendanceById);
router.post("/", auth, authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), createAttendance);
router.put("/:id", auth, authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), updateAttendance);

module.exports = router;