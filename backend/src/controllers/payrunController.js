const Payrun = require("../models/Payrun");
const Payslip = require("../models/Payslip");
const Employee = require("../models/Employee");
const SalaryStructure = require("../models/SalaryStructure");
const { findApplicableContract } = require("../services/contractService");
const { calculateSalary } = require("../services/salaryRuleEngine");
const { validateEmployeePayslip } = require("../services/warningsService");
const { sendBulkPayslips } = require("../services/emailService");

// Query eligible employees for Wizard Step 2
const getEligibleEmployees = async (req, res) => {
    try {
        const { salaryStructureId, periodStart, periodEnd } = req.query;

        if (!periodStart || !periodEnd) {
            return res.status(400).json({
                success: false,
                message: "periodStart and periodEnd are required"
            });
        }

        const pStart = new Date(periodStart);
        const pEnd = new Date(periodEnd);

        // Fetch all active employees
        const employees = await Employee.find({ status: "ACTIVE" })
            .populate("workingSchedule", "name totalWeeklyHours")
            .sort({ firstName: 1 });

        const eligible = [];

        for (const emp of employees) {
            const contract = await findApplicableContract(emp._id, pStart, pEnd);

            // If structure is specified, optionally filter or check match
            let matchesStructure = true;
            if (salaryStructureId && contract?.salaryStructure) {
                matchesStructure = contract.salaryStructure._id.toString() === salaryStructureId.toString();
            }

            const bankComplete = Boolean(
                emp.bankDetails?.accountNumber &&
                emp.bankDetails?.bankName &&
                emp.bankDetails?.ifscRouting
            );

            eligible.push({
                employee: emp,
                hasActiveContract: Boolean(contract),
                contract: contract || null,
                matchesStructure,
                bankComplete,
                isEligible: Boolean(contract)
            });
        }

        res.json({
            success: true,
            count: eligible.length,
            data: eligible
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// List Payruns
const getAllPayruns = async (req, res) => {
    try {
        const payruns = await Payrun.find()
            .populate("salaryStructure", "name code")
            .populate("employees", "firstName lastName employeeId department")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: payruns.length, data: payruns });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Payrun with populated payslips
const getPayrunById = async (req, res) => {
    try {
        const payrun = await Payrun.findById(req.params.id)
            .populate("salaryStructure")
            .populate("employees", "firstName lastName employeeId department email avatar bankDetails");

        if (!payrun) {
            return res.status(404).json({ success: false, message: "Payrun not found" });
        }

        const payslips = await Payslip.find({ payrun: payrun._id })
            .populate("employee", "firstName lastName employeeId department email avatar bankDetails")
            .populate("contract", "contractReference salary contractType")
            .sort({ createdAt: 1 });

        const obj = payrun.toObject();
        obj.payslips = payslips;

        res.json({ success: true, data: obj });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Payrun (from Wizard Step 3)
const createPayrun = async (req, res) => {
    try {
        const { name, periodStart, periodEnd, salaryStructure, employees } = req.body;

        if (!employees || employees.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one employee must be selected for the payrun batch."
            });
        }

        const payrun = await Payrun.create({
            name,
            periodStart,
            periodEnd,
            salaryStructure,
            employees,
            status: "DRAFT"
        });

        const populated = await Payrun.findById(payrun._id)
            .populate("salaryStructure")
            .populate("employees");

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Compute Payrun (Calculates Payslips using period contracts and salary rules)
const computePayrun = async (req, res) => {
    try {
        const payrun = await Payrun.findById(req.params.id)
            .populate({
                path: "salaryStructure",
                populate: { path: "rules", options: { sort: { sequence: 1 } } }
            })
            .populate("employees");

        if (!payrun) {
            return res.status(404).json({ success: false, message: "Payrun not found" });
        }

        const rules = payrun.salaryStructure?.rules || [];
        const batchWarnings = [];
        let totalGross = 0;
        let totalDeductions = 0;
        let totalNet = 0;

        const payslipDocs = [];

        for (const emp of payrun.employees) {
            // Find applicable contract for this period
            const contract = await findApplicableContract(
                emp._id,
                payrun.periodStart,
                payrun.periodEnd
            );

            const baseSalary = contract ? contract.salary : 0;

            // Compute salary lines
            const computed = calculateSalary(rules, baseSalary);

            // Detect warnings
            const warnings = await validateEmployeePayslip(
                emp,
                contract,
                payrun,
                computed.netSalary
            );

            batchWarnings.push(...warnings);

            totalGross += computed.grossSalary;
            totalDeductions += computed.totalDeductions;
            totalNet += computed.netSalary;

            // Check if payslip already exists for this payrun & employee
            let payslip = await Payslip.findOne({
                payrun: payrun._id,
                employee: emp._id
            });

            if (!payslip) {
                payslip = new Payslip({
                    payrun: payrun._id,
                    employee: emp._id,
                    contract: contract ? contract._id : null,
                    salaryStructure: payrun.salaryStructure._id,
                    periodStart: payrun.periodStart,
                    periodEnd: payrun.periodEnd,
                    status: "COMPUTED",
                    workedDays: 22,
                    totalWorkingDays: 22,
                    lines: computed.lines,
                    basicSalary: computed.basicSalary,
                    totalAllowances: computed.totalAllowances,
                    grossSalary: computed.grossSalary,
                    totalDeductions: computed.totalDeductions,
                    netSalary: computed.netSalary,
                    warnings
                });
            } else {
                payslip.contract = contract ? contract._id : null;
                payslip.status = "COMPUTED";
                payslip.lines = computed.lines;
                payslip.basicSalary = computed.basicSalary;
                payslip.totalAllowances = computed.totalAllowances;
                payslip.grossSalary = computed.grossSalary;
                payslip.totalDeductions = computed.totalDeductions;
                payslip.netSalary = computed.netSalary;
                payslip.warnings = warnings;
            }

            await payslip.save();
            payslipDocs.push(payslip);
        }

        payrun.status = "COMPUTED";
        payrun.totalGross = Number(totalGross.toFixed(2));
        payrun.totalDeductions = Number(totalDeductions.toFixed(2));
        payrun.totalNet = Number(totalNet.toFixed(2));
        payrun.warnings = batchWarnings;

        await payrun.save();

        const updated = await Payrun.findById(payrun._id)
            .populate("salaryStructure")
            .populate("employees");

        const populatedPayslips = await Payslip.find({ payrun: payrun._id })
            .populate("employee", "firstName lastName employeeId department email bankDetails")
            .populate("contract", "contractReference salary contractType");

        const obj = updated.toObject();
        obj.payslips = populatedPayslips;

        res.json({
            success: true,
            message: `Computed ${payslipDocs.length} payslips successfully`,
            data: obj
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Validate Payrun
const validatePayrun = async (req, res) => {
    try {
        const payrun = await Payrun.findById(req.params.id);
        if (!payrun) return res.status(404).json({ success: false, message: "Payrun not found" });

        if (payrun.status === "DRAFT") {
            return res.status(400).json({
                success: false,
                message: "Please compute payslips before validating the payrun batch."
            });
        }

        payrun.status = "VALIDATED";
        payrun.validationNotes = req.body.validationNotes || "Verified and validated by payroll officer";
        await payrun.save();

        await Payslip.updateMany(
            { payrun: payrun._id },
            { status: "VALIDATED" }
        );

        res.json({
            success: true,
            message: "Payrun batch validated successfully",
            data: payrun
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark Payrun Paid
const markPaidPayrun = async (req, res) => {
    try {
        const payrun = await Payrun.findById(req.params.id);
        if (!payrun) return res.status(404).json({ success: false, message: "Payrun not found" });

        payrun.status = "PAID";
        payrun.paidAt = new Date();
        await payrun.save();

        await Payslip.updateMany(
            { payrun: payrun._id },
            { status: "PAID", paidAt: new Date() }
        );

        res.json({
            success: true,
            message: "Payrun marked as PAID successfully",
            data: payrun
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Bulk Send Payslips via Email
const bulkSendEmails = async (req, res) => {
    try {
        const payrun = await Payrun.findById(req.params.id);
        if (!payrun) return res.status(404).json({ success: false, message: "Payrun not found" });

        const payslips = await Payslip.find({ payrun: payrun._id }).populate("employee");

        const dispatchPayload = payslips.map((ps) => ({
            employee: ps.employee,
            payslip: ps
        }));

        const result = await sendBulkPayslips(dispatchPayload, payrun);

        // Update payslips email status
        await Payslip.updateMany(
            { payrun: payrun._id },
            { emailStatus: "SENT", sentAt: new Date() }
        );

        payrun.sentAt = new Date();
        payrun.emailCount = result.totalDispatched;
        await payrun.save();

        res.json({
            success: true,
            message: `Dispatched ${result.totalDispatched} payslip email(s)`,
            data: {
                totalDispatched: result.totalDispatched,
                totalFailed: result.totalFailed,
                sentAt: payrun.sentAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Payrun
const deletePayrun = async (req, res) => {
    try {
        const payrun = await Payrun.findById(req.params.id);
        if (!payrun) return res.status(404).json({ success: false, message: "Payrun not found" });

        if (payrun.status === "PAID") {
            return res.status(400).json({
                success: false,
                message: "Cannot delete finalized/paid payruns. Historical records must be preserved."
            });
        }

        await Payslip.deleteMany({ payrun: payrun._id });
        await Payrun.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: "Payrun and associated payslips removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getEligibleEmployees,
    getAllPayruns,
    getPayrunById,
    createPayrun,
    computePayrun,
    validatePayrun,
    markPaidPayrun,
    bulkSendEmails,
    deletePayrun
};
