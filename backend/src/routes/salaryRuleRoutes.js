const express = require("express");

const {
    createSalaryRule,
    getSalaryRules,
    getSalaryRuleById,
    updateSalaryRule
} = require("../controllers/salaryRuleController");

const router = express.Router();

router.post("/", createSalaryRule);
router.get("/", getSalaryRules);
router.get("/:id", getSalaryRuleById);
router.put("/:id", updateSalaryRule);

module.exports = router;