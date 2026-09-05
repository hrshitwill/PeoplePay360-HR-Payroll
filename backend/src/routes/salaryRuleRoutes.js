const express = require("express");
const router = express.Router();
const {
    getAllRules,
    getRuleById,
    createRule,
    updateRule,
    deleteRule
} = require("../controllers/salaryRuleController");

router.get("/", getAllRules);
router.get("/:id", getRuleById);
router.post("/", createRule);
router.put("/:id", updateRule);
router.delete("/:id", deleteRule);

module.exports = router;
