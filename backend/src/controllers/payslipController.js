const Payslip = require("../models/Payslip");
const { sendPayslipEmail } = require("../services/emailService");

const getAllPayslips = async (req, res) => {
    try {
        const { employeeId, payrunId, status } = req.query;
        const query = {};

        if (employeeId && employeeId !== "undefined" && employeeId !== "null") query.employee = employeeId;
        if (payrunId && payrunId !== "undefined" && payrunId !== "null") query.payrun = payrunId;
        if (status && status !== "undefined" && status !== "null") query.status = status;

        const payslips = await Payslip.find(query)
            .populate("employee", "firstName lastName employeeId department jobTitle email avatar bankDetails")
            .populate("payrun", "name periodStart periodEnd status payrunBatchNumber")
            .populate("contract", "contractReference salary contractType")
            .populate("salaryStructure", "name code")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: payslips.length, data: payslips });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPayslipById = async (req, res) => {
    try {
        const payslip = await Payslip.findById(req.params.id)
            .populate("employee")
            .populate("payrun")
            .populate("contract")
            .populate("salaryStructure");

        if (!payslip) {
            return res.status(404).json({ success: false, message: "Payslip not found" });
        }

        res.json({ success: true, data: payslip });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const sendSinglePayslipEmail = async (req, res) => {
    try {
        const payslip = await Payslip.findById(req.params.id)
            .populate("employee")
            .populate("payrun");

        if (!payslip) {
            return res.status(404).json({ success: false, message: "Payslip not found" });
        }

        const log = await sendPayslipEmail(payslip.employee, payslip, payslip.payrun);

        payslip.emailStatus = log.status;
        payslip.sentAt = new Date();
        await payslip.save();

        res.json({
            success: true,
            message: `Payslip email sent to ${payslip.employee.email}`,
            data: log
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllPayslips,
    getPayslipById,
    sendSinglePayslipEmail
};
