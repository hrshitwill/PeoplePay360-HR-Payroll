const Payslip = require("../models/Payslip");
const Payrun = require("../models/Payrun");
const Contract = require("../models/Contract");

const { calculatePayroll } = require("../services/payrollEngine");


// Get all payslips
const getPayslips = async (req, res) => {
    try {
        const filter = {};
        if (req.query.employee) filter.employee = req.query.employee;
        if (req.query.payrun) filter.payrun = req.query.payrun;
        if (req.query.status) filter.status = req.query.status;

        const payslips = await Payslip.find(filter)
            .populate("employee")
            .populate("payrun")
            .populate("contract")
            .populate("salaryStructure")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: payslips
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get payslip by ID
const getPayslipById = async (req, res) => {
    try {
        const payslip = await Payslip.findById(req.params.id)
            .populate("employee")
            .populate("payrun")
            .populate("contract")
            .populate({
                path: "salaryStructure",
                populate: { path: "rules" }
            });

        if (!payslip) {
            return res.status(404).json({
                success: false,
                message: "Payslip not found"
            });
        }

        res.json({
            success: true,
            data: payslip
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get payslips by employee
const getEmployeePayslips = async (req, res) => {
    try {
        const payslips = await Payslip.find({
            employee: req.params.employeeId
        })
            .populate("payrun")
            .populate("contract")
            .sort({ periodStart: -1 });

        res.json({
            success: true,
            data: payslips
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Generate PDF data for a payslip (returns structured JSON for client-side PDF generation)
const getPayslipPDF = async (req, res) => {
    try {
        const payslip = await Payslip.findById(req.params.id)
            .populate("employee")
            .populate("payrun")
            .populate("contract")
            .populate("salaryStructure");

        if (!payslip) {
            return res.status(404).json({
                success: false,
                message: "Payslip not found"
            });
        }

        // Return structured data for PDF generation
        const pdfData = {
            company: {
                name: "PeoplePay360",
                tagline: "HR & Payroll Platform"
            },
            employee: {
                name: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
                id: payslip.employee.employeeId,
                email: payslip.employee.email,
                department: payslip.employee.department,
                jobTitle: payslip.employee.jobTitle,
                bankAccount: payslip.employee.bankAccount || "N/A"
            },
            period: {
                start: payslip.periodStart,
                end: payslip.periodEnd
            },
            payrun: payslip.payrun?.name || "N/A",
            contractSalary: payslip.contractSalary,
            workedDays: payslip.workedDays,
            earnings: payslip.earnings,
            deductions: payslip.deductions,
            gross: payslip.gross,
            totalDeductions: payslip.totalDeductions,
            net: payslip.net,
            breakdown: payslip.breakdown,
            status: payslip.status,
            generatedAt: payslip.createdAt
        };

        res.json({
            success: true,
            data: pdfData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    getPayslips,
    getPayslipById,
    getEmployeePayslips,
    getPayslipPDF
};