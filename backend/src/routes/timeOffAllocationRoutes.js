const express = require("express");

const {
    createAllocation,
    getAllocations,
    getAllocationById,
    getEmployeeAllocations,
    approveAllocation,
    refuseAllocation,
    updateAllocation
} = require("../controllers/timeOffAllocationController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(auth);

router.get("/", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getAllocations);
router.get("/employee/:employeeId", getEmployeeAllocations);
router.get("/:id", getAllocationById);

router.post("/", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), createAllocation);
router.put("/:id", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), updateAllocation);

router.put("/:id/approve", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), approveAllocation);
router.put("/:id/refuse", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), refuseAllocation);

module.exports = router;
