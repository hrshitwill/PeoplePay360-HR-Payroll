const express = require("express");
const { getDashboard } = require("../controllers/dashboardController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.get("/", auth, authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getDashboard);

module.exports = router;
