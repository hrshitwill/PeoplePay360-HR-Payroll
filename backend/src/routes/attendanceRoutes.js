const express = require("express");
const router = express.Router();
const {
    getAllAttendance,
    clockIn,
    clockOut,
    manualCorrection,
    createAttendance,
    getAttendanceStats
} = require("../controllers/attendanceController");

router.get("/", getAllAttendance);
router.get("/stats", getAttendanceStats);
router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);
router.post("/manual", createAttendance);
router.put("/:id/correct", manualCorrection);

module.exports = router;
