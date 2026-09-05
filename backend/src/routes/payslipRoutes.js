const express = require("express");
const router = express.Router();
const {
    getAllPayslips,
    getPayslipById,
    sendSinglePayslipEmail,
    getEmployeePayruns
} = require("../controllers/payslipController");

router.get("/", getAllPayslips);
router.get("/employee/:employeeId", getEmployeePayruns);
router.get("/:id", getPayslipById);
router.post("/:id/send-email", sendSinglePayslipEmail);

module.exports = router;
