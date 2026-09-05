const express = require("express");
const router = express.Router();
const {
    getAllPayslips,
    getPayslipById,
    sendSinglePayslipEmail
} = require("../controllers/payslipController");

router.get("/", getAllPayslips);
router.get("/:id", getPayslipById);
router.post("/:id/send-email", sendSinglePayslipEmail);

module.exports = router;
