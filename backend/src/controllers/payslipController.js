const Payslip = require("../models/Payslip");
const Payrun = require("../models/Payrun");
const Contract = require("../models/Contract");

const { calculatePayroll } = require("../services/payrollEngine");


// Generate payslips for a payrun
const generatePayslips = async (req, res) => {
    try {
        const payrun = await Payrun.findById(req.params.id)
            .populate({
                path: "salaryStructure",
                populate: {
                    path: "rules"
                }
            })
            .populate("employees");

        if (!payrun) {
            return res.status(404).json({
                success: false,
                message: "Payrun not found"
            });
        }

        if (
            payrun.status !== "COMPUTED" &&
            payrun.status !== "VALIDATED"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payrun must be COMPUTED or VALIDATED before generating payslips"
            });
        }

        const errors = [];

        // First validate everything
        for (const employee of payrun.employees) {

            // Check duplicate payslip
            const existingPayslip = await Payslip.findOne({
                employee: employee._id,
                payrun: payrun._id
            });

            if (existingPayslip) {
                errors.push(
                    `${employee.firstName} ${employee.lastName}: Payslip already exists`
                );

                continue;
            }

            // Find contract valid for this payroll period
            const contract = await Contract.findOne({
                employee: employee._id,

                startDate: {
                    $lte: payrun.periodEnd
                },

                $or: [
                    { endDate: null },
                    { endDate: { $gte: payrun.periodStart } }
                ],

                status: "ACTIVE"
            }).sort({
                startDate: -1
            });

            if (!contract) {
                errors.push(
                    `${employee.firstName} ${employee.lastName}: No active contract found`
                );
            }
        }

        // Don't create partial payslips
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Payslip generation failed",
                errors
            });
        }


        const generatedPayslips = [];


        // Generate payslips
        for (const employee of payrun.employees) {

            const contract = await Contract.findOne({
                employee: employee._id,

                startDate: {
                    $lte: payrun.periodEnd
                },

                $or: [
                    { endDate: null },
                    { endDate: { $gte: payrun.periodStart } }
                ],

                status: "ACTIVE"
            }).sort({
                startDate: -1
            });


            const payroll = calculatePayroll(
                contract.salary,
                payrun.salaryStructure.rules
            );


            const earnings = payroll.breakdown
                .filter(rule => rule.type === "EARNING")
                .map(rule => ({
                    code: rule.code,
                    name: rule.name,
                    amount: rule.amount
                }));


            const deductions = payroll.breakdown
                .filter(rule => rule.type === "DEDUCTION")
                .map(rule => ({
                    code: rule.code,
                    name: rule.name,
                    amount: rule.amount
                }));


            const payslip = await Payslip.create({
                employee: employee._id,
                payrun: payrun._id,

                periodStart: payrun.periodStart,
                periodEnd: payrun.periodEnd,

                contractSalary: contract.salary,

                earnings,
                deductions,

                gross: payroll.gross,
                totalDeductions: payroll.deductions,
                net: payroll.net,

                breakdown: payroll.breakdown,

                status: "GENERATED"
            });


            generatedPayslips.push(payslip);
        }


        res.status(201).json({
            success: true,
            message: "Payslips generated successfully",
            data: generatedPayslips
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// Get all payslips
const getPayslips = async (req, res) => {
    try {

        const payslips = await Payslip.find()
            .populate("employee")
            .populate("payrun")
            .sort({
                createdAt: -1
            });

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
            .populate("payrun");

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


module.exports = {
    generatePayslips,
    getPayslips,
    getPayslipById
};