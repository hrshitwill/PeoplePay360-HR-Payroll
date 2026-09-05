const Payrun = require("../models/Payrun");
const Employee = require("../models/Employee");
const Contract = require("../models/Contract");
const Payslip = require("../models/Payslip");
const { calculatePayroll } = require("../services/payrollEngine");


// Create Payrun
const createPayrun = async (req, res) => {
    try {
        const payrun = await Payrun.create(req.body);

        res.status(201).json({
            success: true,
            data: payrun
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// Get all Payruns
const getPayruns = async (req, res) => {
    try {
        const payruns = await Payrun.find()
            .populate("salaryStructure")
            .populate("employees")
            .sort({ createdAt: -1 });

        // Attach payslip counts
        const payrunsWithCounts = await Promise.all(
            payruns.map(async (payrun) => {
                const payslipCount = await Payslip.countDocuments({
                    payrun: payrun._id
                });
                return {
                    ...payrun.toObject(),
                    payslipCount
                };
            })
        );

        res.json({
            success: true,
            data: payrunsWithCounts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get Payrun by ID
const getPayrunById = async (req, res) => {
    try {
        const payrun = await Payrun.findById(req.params.id)
            .populate("salaryStructure")
            .populate("employees");

        if (!payrun) {
            return res.status(404).json({
                success: false,
                message: "Payrun not found"
            });
        }

        // Get associated payslips
        const payslips = await Payslip.find({ payrun: payrun._id })
            .populate("employee");

        res.json({
            success: true,
            data: {
                ...payrun.toObject(),
                payslips
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get eligible employees for a payrun (wizard step 2)
const getEligibleEmployees = async (req, res) => {
    try {
        const { structureId, periodStart, periodEnd } = req.query;

        // Find employees with active contracts that have this salary structure
        // and are valid for the period
        const contractFilter = {
            status: "ACTIVE",
            startDate: { $lte: new Date(periodEnd) },
            $or: [
                { endDate: null },
                { endDate: { $gte: new Date(periodStart) } }
            ]
        };

        if (structureId) {
            contractFilter.salaryStructure = structureId;
        }

        const contracts = await Contract.find(contractFilter)
            .populate("employee")
            .populate("salaryStructure");

        // Get unique employees
        const employeeMap = new Map();
        contracts.forEach(contract => {
            if (contract.employee && contract.employee.status === "ACTIVE") {
                employeeMap.set(contract.employee._id.toString(), {
                    employee: contract.employee,
                    contract: {
                        _id: contract._id,
                        salary: contract.salary,
                        contractType: contract.contractType,
                        startDate: contract.startDate,
                        endDate: contract.endDate
                    }
                });
            }
        });

        res.json({
            success: true,
            data: Array.from(employeeMap.values())
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Compute Payrun - generates payslips
const computePayrun = async (req, res) => {
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

        if (payrun.status !== "DRAFT") {
            return res.status(400).json({
                success: false,
                message: "Only DRAFT payruns can be computed"
            });
        }

        if (!payrun.salaryStructure) {
            return res.status(400).json({
                success: false,
                message: "Salary structure is missing"
            });
        }

        if (!payrun.salaryStructure.rules ||
            payrun.salaryStructure.rules.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Salary structure has no active rules"
            });
        }

        if (!payrun.employees || payrun.employees.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No employees found in payrun"
            });
        }

        let totalGross = 0;
        let totalDeductions = 0;
        let totalNet = 0;
        const warnings = [];
        const generatedPayslips = [];

        for (const employee of payrun.employees) {
            // Check for duplicate payslip
            const existingPayslip = await Payslip.findOne({
                employee: employee._id,
                payrun: payrun._id
            });

            if (existingPayslip) {
                warnings.push(`${employee.firstName} ${employee.lastName}: Duplicate payslip skipped`);
                continue;
            }

            const contract = await Contract.findOne({
                employee: employee._id,
                startDate: { $lte: payrun.periodEnd },
                $or: [
                    { endDate: null },
                    { endDate: { $gte: payrun.periodStart } }
                ],
                status: "ACTIVE"
            }).sort({ startDate: -1 });

            if (!contract) {
                warnings.push(`${employee.firstName} ${employee.lastName}: No active contract found`);
                continue;
            }

            // Check for missing bank account
            if (!employee.bankAccount) {
                warnings.push(`${employee.firstName} ${employee.lastName}: Missing bank account details`);
            }

            const result = calculatePayroll(
                contract.salary,
                payrun.salaryStructure.rules
            );

            const earnings = result.breakdown
                .filter(rule => rule.type === "EARNING")
                .map(rule => ({
                    code: rule.code,
                    name: rule.name,
                    category: rule.category,
                    amount: rule.amount
                }));

            const deductions = result.breakdown
                .filter(rule => rule.type === "DEDUCTION")
                .map(rule => ({
                    code: rule.code,
                    name: rule.name,
                    category: rule.category,
                    amount: rule.amount
                }));

            const payslip = await Payslip.create({
                employee: employee._id,
                payrun: payrun._id,
                contract: contract._id,
                salaryStructure: payrun.salaryStructure._id,
                periodStart: payrun.periodStart,
                periodEnd: payrun.periodEnd,
                contractSalary: contract.salary,
                workedDays: 22, // default working days
                earnings,
                deductions,
                gross: result.gross,
                totalDeductions: result.deductions,
                net: result.net,
                breakdown: result.breakdown,
                warnings: !employee.bankAccount
                    ? ["Missing bank account details"]
                    : [],
                status: "GENERATED"
            });

            generatedPayslips.push(payslip);
            totalGross += result.gross;
            totalDeductions += result.deductions;
            totalNet += result.net;
        }

        payrun.totalGross = totalGross;
        payrun.totalDeductions = totalDeductions;
        payrun.totalNet = totalNet;
        payrun.status = "COMPUTED";
        payrun.warnings = warnings;

        await payrun.save();

        res.json({
            success: true,
            message: "Payrun computed successfully",
            data: {
                payrun,
                payslips: generatedPayslips,
                warnings
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Validate Payrun
const validatePayrun = async (req, res) => {
    try {
        const payrun = await Payrun.findById(req.params.id)
            .populate("employees")
            .populate("salaryStructure");

        if (!payrun) {
            return res.status(404).json({
                success: false,
                message: "Payrun not found"
            });
        }

        if (payrun.status !== "COMPUTED") {
            return res.status(400).json({
                success: false,
                message: "Only COMPUTED payruns can be validated"
            });
        }

        const errors = [];

        if (!payrun.salaryStructure) {
            errors.push("Salary structure is missing");
        }

        if (!payrun.employees || payrun.employees.length === 0) {
            errors.push("No employees are assigned to this payrun");
        }

        if (payrun.totalNet < 0) {
            errors.push("Net salary cannot be negative");
        }

        // Check all payslips exist
        const payslipCount = await Payslip.countDocuments({ payrun: payrun._id });
        if (payslipCount === 0) {
            errors.push("No payslips generated for this payrun");
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Payroll validation failed",
                errors
            });
        }

        payrun.status = "VALIDATED";
        await payrun.save();

        // Update all payslips status
        await Payslip.updateMany(
            { payrun: payrun._id },
            { status: "VALIDATED" }
        );

        res.json({
            success: true,
            message: "Payrun validated successfully",
            data: payrun
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Mark Payrun as Paid
const markPaid = async (req, res) => {
    try {
        const payrun = await Payrun.findById(req.params.id);

        if (!payrun) {
            return res.status(404).json({
                success: false,
                message: "Payrun not found"
            });
        }

        if (payrun.status !== "VALIDATED") {
            return res.status(400).json({
                success: false,
                message: "Only VALIDATED payruns can be marked as paid"
            });
        }

        payrun.status = "PAID";
        payrun.paidDate = new Date();
        await payrun.save();

        // Update all payslips status
        await Payslip.updateMany(
            { payrun: payrun._id },
            { status: "PAID" }
        );

        res.json({
            success: true,
            message: "Payrun marked as paid",
            data: payrun
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Send Payslips (simulate bulk email)
const sendPayslips = async (req, res) => {
    try {
        const payrun = await Payrun.findById(req.params.id)
            .populate("employees");

        if (!payrun) {
            return res.status(404).json({
                success: false,
                message: "Payrun not found"
            });
        }

        if (payrun.status !== "PAID" && payrun.status !== "VALIDATED") {
            return res.status(400).json({
                success: false,
                message: "Payrun must be VALIDATED or PAID to send payslips"
            });
        }

        const payslips = await Payslip.find({ payrun: payrun._id })
            .populate("employee");

        const sentTo = [];
        const failedFor = [];

        for (const payslip of payslips) {
            if (payslip.employee && payslip.employee.email) {
                // In production, integrate with email service here
                sentTo.push({
                    employee: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
                    email: payslip.employee.email
                });
            } else {
                failedFor.push({
                    employee: payslip.employee
                        ? `${payslip.employee.firstName} ${payslip.employee.lastName}`
                        : "Unknown",
                    reason: "Missing email address"
                });
            }
        }

        res.json({
            success: true,
            message: `Payslips sent to ${sentTo.length} employee(s)`,
            data: {
                sent: sentTo,
                failed: failedFor
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createPayrun,
    getPayruns,
    getPayrunById,
    getEligibleEmployees,
    computePayrun,
    validatePayrun,
    markPaid,
    sendPayslips
};