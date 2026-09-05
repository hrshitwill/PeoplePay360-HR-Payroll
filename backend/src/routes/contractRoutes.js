const express = require("express");

const {
    createContract,
    getAllContracts,
    getContractById,
    updateContract,
    deleteContract
} = require("../controllers/contractController");

const router = express.Router();

router.post("/", createContract);
router.get("/", getAllContracts);
router.get("/:id", getContractById);
router.put("/:id", updateContract);
router.delete("/:id", deleteContract);

module.exports = router;