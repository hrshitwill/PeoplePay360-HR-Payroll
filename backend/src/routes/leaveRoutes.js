const express = require("express");

const {
    createLeave,
    getLeaves,
    getEmployeeLeaves,
    approveLeave,
    rejectLeave
} = require("../controllers/leaveController");

const router = express.Router();

router.post("/", createLeave);

router.get("/", getLeaves);

router.get("/employee/:employeeId", getEmployeeLeaves);

router.put("/:id/approve", approveLeave);

router.put("/:id/reject", rejectLeave);

module.exports = router;