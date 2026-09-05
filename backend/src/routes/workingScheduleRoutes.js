const express = require("express");

const {
    createSchedule,
    getSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
} = require("../controllers/workingScheduleController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(auth); // Protect all routes

router.get("/", getSchedules);
router.get("/:id", getScheduleById);

router.post("/", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), createSchedule);
router.put("/:id", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), updateSchedule);
router.delete("/:id", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), deleteSchedule);

module.exports = router;
