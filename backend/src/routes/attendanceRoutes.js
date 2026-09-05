const express = require("express");
const router = express.Router();
const {
    getAllAttendance,
    clockIn,
    clockOut,
    manualCorrection,
    createAttendance,
    getAttendanceStats,
    getTodayAttendance,
    getEmployeeAttendance
} = require("../controllers/attendanceController");

router.get("/", getAllAttendance);
router.get("/stats", getAttendanceStats);
router.get("/today/:employeeId", getTodayAttendance);
router.get("/employee/:employeeId", getEmployeeAttendance);
router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);
router.post("/manual", createAttendance);
router.put("/:id/correct", manualCorrection);

module.exports = router;
