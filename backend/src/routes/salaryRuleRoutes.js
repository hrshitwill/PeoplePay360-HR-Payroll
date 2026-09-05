const express = require("express");
const {
    createSalaryRule,
    getSalaryRules,
    getSalaryRuleById,
    updateSalaryRule
} = require("../controllers/salaryRuleController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(auth);

router.get("/", authorize("ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getSalaryRules);
router.get("/:id", authorize("ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getSalaryRuleById);

router.post("/", authorize("ADMIN", "HR_PAYROLL_MANAGER"), createSalaryRule);
router.put("/:id", authorize("ADMIN", "HR_PAYROLL_MANAGER"), updateSalaryRule);

module.exports = router;