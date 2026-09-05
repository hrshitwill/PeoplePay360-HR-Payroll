const express = require("express");
const {
    createContract,
    getContracts,
    getContractById,
    getEmployeeContracts,
    updateContract,
    deleteContract
} = require("../controllers/contractController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(auth);

router.get("/", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getContracts);
router.get("/employee/:employeeId", getEmployeeContracts);
router.get("/:id", getContractById);

router.post("/", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), createContract);
router.put("/:id", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), updateContract);
router.delete("/:id", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), deleteContract);

module.exports = router;