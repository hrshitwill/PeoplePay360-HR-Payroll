const Payrun = require("../models/Payrun");
const Employee = require("../models/Employee");
const Contract = require("../models/Contract");
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

        res.json({
            success: true,
            data: payruns
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

        res.json({
            success: true,
            data: payrun
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Compute Payrun
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

        const employeeResults = [];

        for (const employee of payrun.employees) {

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
                employeeResults.push({
                    employee: employee._id,
                    employeeName: `${employee.firstName} ${employee.lastName}`,
                    error: "No active contract found"
                });

                continue;
            }

            const result = calculatePayroll(
                contract.salary,
                payrun.salaryStructure.rules
            );

            totalGross += result.gross;
            totalDeductions += result.deductions;
            totalNet += result.net;

            employeeResults.push({
                employee: employee._id,
                employeeName: `${employee.firstName} ${employee.lastName}`,
                contractSalary: contract.salary,
                payroll: result
            });
        }

        payrun.totalGross = totalGross;
        payrun.totalDeductions = totalDeductions;
        payrun.totalNet = totalNet;
        payrun.status = "COMPUTED";

        await payrun.save();

        res.json({
            success: true,
            message: "Payrun computed successfully",
            data: {
                payrun,
                employees: employeeResults
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
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

        // Check salary structure
        if (!payrun.salaryStructure) {
            errors.push("Salary structure is missing");
        }

        // Check employees
        if (!payrun.employees || payrun.employees.length === 0) {
            errors.push("No employees are assigned to this payrun");
        }

        // Check payroll totals
        if (payrun.totalGross < 0) {
            errors.push("Gross salary cannot be negative");
        }

        if (payrun.totalDeductions < 0) {
            errors.push("Deductions cannot be negative");
        }

        if (payrun.totalNet < 0) {
            errors.push("Net salary cannot be negative");
        }

        // Check salary structure rules
        if (
            payrun.salaryStructure &&
            (!payrun.salaryStructure.rules ||
                payrun.salaryStructure.rules.length === 0)
        ) {
            errors.push("Salary structure has no salary rules");
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

module.exports = {
    createPayrun,
    getPayruns,
    getPayrunById,
    validatePayrun,
    computePayrun
};