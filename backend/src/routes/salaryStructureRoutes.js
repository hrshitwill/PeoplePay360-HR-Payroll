const express = require("express");

const {
    createSalaryStructure,
    getSalaryStructures,
    getSalaryStructureById,
    updateSalaryStructure
} = require("../controllers/salaryStructureController");

const router = express.Router();

router.post("/", createSalaryStructure);
router.get("/", getSalaryStructures);
router.get("/:id", getSalaryStructureById);
router.put("/:id", updateSalaryStructure);

module.exports = router;