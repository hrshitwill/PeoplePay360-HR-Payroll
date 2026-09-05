const Payslip = require("../models/Payslip");
const Contract = require("../models/Contract");
const TimeOffRequest = require("../models/TimeOffRequest");

/**
 * Validates a payslip and returns operational warnings / errors
 */
const validateEmployeePayslip = async (employee, contract, payrun, netSalary) => {
    const warnings = [];

    // 1. Bank Details Check
    const bank = employee.bankDetails || {};
    if (!bank.accountNumber || !bank.bankName || !bank.ifscRouting) {
        warnings.push({
            employeeId: employee.employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            type: "MISSING_BANK_DETAILS",
            message: `Employee ${employee.firstName} ${employee.lastName} is missing complete bank disbursement details.`,
            severity: "WARNING"
        });
    }

    // 2. Active Contract Check
    if (!contract) {
        warnings.push({
            employeeId: employee.employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            type: "NO_ACTIVE_CONTRACT",
            message: `No active contract found valid for the period ${new Date(payrun.periodStart).toLocaleDateString()} - ${new Date(payrun.periodEnd).toLocaleDateString()}.`,
            severity: "ERROR"
        });
    } else if (contract.endDate && new Date(contract.endDate) < new Date(payrun.periodEnd)) {
        warnings.push({
            employeeId: employee.employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            type: "CONTRACT_EXPIRING",
            message: `Contract expires on ${new Date(contract.endDate).toLocaleDateString()} prior to period end.`,
            severity: "INFO"
        });
    }

    // 3. Duplicate Payslip Check (in another payrun for same period)
    const existingDuplicate = await Payslip.findOne({
        employee: employee._id,
        payrun: { $ne: payrun._id },
        $or: [
            {
                periodStart: { $lte: payrun.periodEnd },
                periodEnd: { $gte: payrun.periodStart }
            }
        ]
    }).populate("payrun", "name payrunBatchNumber");

    if (existingDuplicate) {
        warnings.push({
            employeeId: employee.employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            type: "DUPLICATE_PAYSLIP",
            message: `Employee already has a payslip in payrun ${existingDuplicate.payrun?.name || existingDuplicate.payrun?.payrunBatchNumber} for an overlapping period.`,
            severity: "WARNING"
        });
    }

    // 4. Net Salary Check
    if (netSalary <= 0) {
        warnings.push({
            employeeId: employee.employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            type: "ZERO_OR_NEGATIVE_SALARY",
            message: `Calculated net salary is $${netSalary} (zero or negative). Deductions may exceed gross pay.`,
            severity: "ERROR"
        });
    }

    // 5. Pending Leaves Check
    const pendingLeaves = await TimeOffRequest.find({
        employee: employee._id,
        status: "PENDING",
        startDate: { $lte: payrun.periodEnd },
        endDate: { $gte: payrun.periodStart }
    });

    if (pendingLeaves.length > 0) {
        warnings.push({
            employeeId: employee.employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            type: "PENDING_LEAVE_REQUESTS",
            message: `Employee has ${pendingLeaves.length} pending leave request(s) awaiting approval in this pay period.`,
            severity: "INFO"
        });
    }

    return warnings;
};

module.exports = {
    validateEmployeePayslip
};
