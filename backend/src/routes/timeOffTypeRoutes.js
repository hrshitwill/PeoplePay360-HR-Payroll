const express = require("express");

const {
    createTimeOffType,
    getTimeOffTypes,
    getTimeOffTypeById,
    updateTimeOffType,
    deleteTimeOffType
} = require("../controllers/timeOffTypeController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(auth);

router.get("/", getTimeOffTypes);
router.get("/:id", getTimeOffTypeById);

router.post("/", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), createTimeOffType);
router.put("/:id", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), updateTimeOffType);
router.delete("/:id", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), deleteTimeOffType);

module.exports = router;
