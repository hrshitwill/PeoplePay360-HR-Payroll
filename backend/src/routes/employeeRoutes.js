const express = require("express");
const {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(auth); // Protect all routes

router.get("/", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"), getEmployees);
router.get("/:id", getEmployeeById);

router.post("/", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), createEmployee);
router.put("/:id", authorize("ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"), updateEmployee);
router.delete("/:id", authorize("ADMIN", "HR_MANAGER"), deleteEmployee);

module.exports = router;