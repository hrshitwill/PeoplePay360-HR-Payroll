const express = require("express");
const router = express.Router();
const {
    getAllTimeOffTypes,
    createTimeOffType,
    updateTimeOffType,
    deleteTimeOffType,
    getAllAllocations,
    createAllocation,
    approveAllocation,
    refuseAllocation,
    getAllRequests,
    createRequest,
    approveRequest,
    refuseRequest,
    getEmployeeBalances
} = require("../controllers/timeOffController");

// Types
router.get("/types", getAllTimeOffTypes);
router.post("/types", createTimeOffType);
router.put("/types/:id", updateTimeOffType);
router.delete("/types/:id", deleteTimeOffType);

// Allocations
router.get("/allocations", getAllAllocations);
router.post("/allocations", createAllocation);
router.put("/allocations/:id/approve", approveAllocation);
router.put("/allocations/:id/refuse", refuseAllocation);

// Requests
router.get("/requests", getAllRequests);
router.post("/requests", createRequest);
router.put("/requests/:id/approve", approveRequest);
router.put("/requests/:id/refuse", refuseRequest);

// Balances
router.get("/balances/:employeeId", getEmployeeBalances);

module.exports = router;
