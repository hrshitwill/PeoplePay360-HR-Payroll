const express = require("express");
const router = express.Router();
const {
    getAllStructures,
    getStructureById,
    createStructure,
    updateStructure,
    deleteStructure
} = require("../controllers/salaryStructureController");

router.get("/", getAllStructures);
router.get("/:id", getStructureById);
router.post("/", createStructure);
router.put("/:id", updateStructure);
router.delete("/:id", deleteStructure);

module.exports = router;
