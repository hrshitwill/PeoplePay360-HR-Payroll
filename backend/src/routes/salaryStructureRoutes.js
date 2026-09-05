const express = require("express");
const {
    createSalaryStructure,
    getSalaryStructures,
    getSalaryStructureById,
    updateSalaryStructure
} = require("../controllers/salaryStructureController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(auth);

router.get("/", authorize("ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getSalaryStructures);
router.get("/:id", authorize("ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getSalaryStructureById);

router.post("/", authorize("ADMIN", "HR_PAYROLL_MANAGER"), createSalaryStructure);
router.put("/:id", authorize("ADMIN", "HR_PAYROLL_MANAGER"), updateSalaryStructure);

module.exports = router;