const express = require("express");

const {
    checkIn,
    checkOut,
    getAttendances,
    getEmployeeAttendance
} = require("../controllers/attendanceController");

const router = express.Router();

router.post("/check-in", checkIn);
router.post("/check-out", checkOut);

router.get("/", getAttendances);

router.get(
    "/employee/:employeeId",
    getEmployeeAttendance
);

module.exports = router;