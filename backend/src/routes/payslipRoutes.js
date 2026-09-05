const express = require("express");

const {
    generatePayslips,
    getPayslips,
    getPayslipById
} = require("../controllers/payslipController");

const router = express.Router();

router.get("/", getPayslips);

router.get("/:id", getPayslipById);

module.exports = router;