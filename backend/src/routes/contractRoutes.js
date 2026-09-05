const express = require("express");

const {
    createContract,
    getContracts,
    getContractById,
    getEmployeeContracts
} = require("../controllers/contractController");

const router = express.Router();

router.post("/", createContract);

router.get("/", getContracts);

router.get("/employee/:employeeId", getEmployeeContracts);

router.get("/:id", getContractById);

module.exports = router;