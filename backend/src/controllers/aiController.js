const Payslip = require("../models/Payslip");
const Payrun = require("../models/Payrun");
const Contract = require("../models/Contract");
const Employee = require("../models/Employee");

/**
 * Controller endpoint: Explain My Payslip
 * Generates plain English explanation of the payslip calculation breakdown.
 */
const explainPayslip = async (req, res) => {
    try {
        const payslip = await Payslip.findById(req.params.id)
            .populate("employee")
            .populate("payrun")
            .populate("contract");

        if (!payslip) {
            return res.status(404).json({ success: false, message: "Payslip not found" });
        }

        const empName = payslip.employee 
            ? `${payslip.employee.firstName || ''} ${payslip.employee.lastName || ''}`.trim() || payslip.employee.name || "Employee"
            : "Employee";

        const startStr = payslip.periodStart ? new Date(payslip.periodStart).toLocaleDateString() : "Period Start";
        const endStr = payslip.periodEnd ? new Date(payslip.periodEnd).toLocaleDateString() : "Period End";
        const periodStr = `${startStr} to ${endStr}`;

        const contractBase = payslip.contract?.salary || payslip.basicSalary || payslip.grossSalary || 0;
        const grossVal = payslip.grossSalary ?? payslip.gross ?? 0;
        const deductionsVal = payslip.totalDeductions ?? 0;
        const netVal = payslip.netSalary ?? payslip.net ?? 0;
        const workedDaysVal = payslip.workedDays || payslip.totalWorkingDays || 22;

        // Parse lines for itemized earnings and deductions
        const lines = payslip.lines || [];
        const earningsLines = lines.filter(l => l.type === "EARNING" || l.category === "BASIC" || l.category === "ALLOWANCE");
        const deductionLines = lines.filter(l => l.type === "DEDUCTION" || l.category === "DEDUCTION");

        // Construct natural language explanation
        let textExplanation = `Hello ${empName},\n\nHere is the natural language explanation for your payslip covering the period ${periodStr}.\n\n`;
        textExplanation += `1. Base & Contract:\n`;
        textExplanation += `   Your active contract base salary is ₹${contractBase.toLocaleString('en-IN')}. During this pay period, you recorded ${workedDaysVal} worked days.\n\n`;

        textExplanation += `2. Earnings Breakdown:\n`;
        if (earningsLines.length === 0) {
            textExplanation += `   - Gross Base Salary: +₹${grossVal.toLocaleString('en-IN')}\n`;
        } else {
            earningsLines.forEach(item => {
                textExplanation += `   - ${item.name} (${item.code}): +₹${(item.amount || 0).toLocaleString('en-IN')}\n`;
            });
        }
        textExplanation += `   Your total gross salary computed is ₹${grossVal.toLocaleString('en-IN')}.\n\n`;

        textExplanation += `3. Deductions Breakdown:\n`;
        if (deductionLines.length === 0) {
            textExplanation += `   - No deductions were applied for this pay period.\n`;
        } else {
            deductionLines.forEach(item => {
                textExplanation += `   - ${item.name} (${item.code}): -₹${(item.amount || 0).toLocaleString('en-IN')}\n`;
            });
        }
        textExplanation += `   Your total deductions sum to ₹${deductionsVal.toLocaleString('en-IN')}.\n\n`;

        textExplanation += `4. Final Take-Home (Net Salary):\n`;
        textExplanation += `   Gross Salary (₹${grossVal.toLocaleString('en-IN')}) minus Deductions (₹${deductionsVal.toLocaleString('en-IN')}) yields a final Net Salary of ₹${netVal.toLocaleString('en-IN')}.\n`;

        res.json({
            success: true,
            data: {
                payslipId: payslip._id,
                employeeName: empName,
                summary: `Net Salary for ${periodStr} is ₹${netVal.toLocaleString('en-IN')}`,
                explanation: textExplanation,
                structuredBreakdown: {
                    contractBase,
                    workedDays: workedDaysVal,
                    gross: grossVal,
                    totalDeductions: deductionsVal,
                    net: netVal,
                    earnings: earningsLines.map(l => ({ name: l.name, code: l.code, amount: l.amount })),
                    deductions: deductionLines.map(l => ({ name: l.name, code: l.code, amount: l.amount }))
                }
            }
        });
    } catch (error) {
        console.error("explainPayslip error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Controller endpoint: Detect AI Anomalies across current Payrun/Payslips
 */
const detectAnomalies = async (req, res) => {
    try {
        const { payrunId } = req.query;
        let query = {};
        if (payrunId) query.payrun = payrunId;

        const payslips = await Payslip.find(query).populate("employee").populate("contract");

        const anomalies = [];

        for (const slip of payslips) {
            if (!slip || !slip.employee) continue;

            const empId = slip.employee._id;
            const empName = `${slip.employee.firstName || ''} ${slip.employee.lastName || ''}`.trim() || slip.employee.name || "Employee";
            const empCode = slip.employee.employeeId || "EMP-000";

            const netVal = slip.netSalary ?? slip.net ?? 0;
            const grossVal = slip.grossSalary ?? slip.gross ?? 0;
            const contractVal = slip.contract?.salary || slip.basicSalary || 0;

            // Find previous payslip for comparison
            const prevSlip = await Payslip.findOne({
                employee: empId,
                _id: { $ne: slip._id },
                createdAt: { $lt: slip.createdAt }
            }).sort({ createdAt: -1 });

            // Anomaly Check 1: Unusually high/low salary variance compared to previous month
            if (prevSlip) {
                const prevNet = prevSlip.netSalary ?? prevSlip.net ?? 0;
                if (prevNet > 0) {
                    const diffPct = ((netVal - prevNet) / prevNet) * 100;
                    if (Math.abs(diffPct) >= 20) {
                        anomalies.push({
                            type: diffPct > 0 ? "SALARY_SPIKE" : "SALARY_DROP",
                            severity: Math.abs(diffPct) > 50 ? "HIGH" : "MEDIUM",
                            employee: { id: empId, name: empName, code: empCode },
                            payslipId: slip._id,
                            message: `${empName}'s net salary changed by ${diffPct.toFixed(1)}% compared to previous payrun (₹${prevNet.toLocaleString('en-IN')} → ₹${netVal.toLocaleString('en-IN')}).`,
                            details: { previousNet: prevNet, currentNet: netVal, percentageChange: diffPct }
                        });
                    }
                }
            }

            // Anomaly Check 2: Contract Salary Mismatch
            if (contractVal > 0 && Math.abs(grossVal - contractVal) > contractVal * 0.4) {
                anomalies.push({
                    type: "CONTRACT_VARIANCE",
                    severity: "MEDIUM",
                    employee: { id: empId, name: empName, code: empCode },
                    payslipId: slip._id,
                    message: `${empName}'s calculated gross (₹${grossVal.toLocaleString('en-IN')}) deviates significantly from active contract base (₹${contractVal.toLocaleString('en-IN')}).`,
                    details: { contractSalary: contractVal, grossSalary: grossVal }
                });
            }

            // Anomaly Check 3: Zero or Negative Net Salary
            if (netVal <= 0) {
                anomalies.push({
                    type: "ZERO_NET_SALARY",
                    severity: "HIGH",
                    employee: { id: empId, name: empName, code: empCode },
                    payslipId: slip._id,
                    message: `${empName} has a zero or negative net salary (₹${netVal.toLocaleString('en-IN')}). Check deductions.`,
                    details: { net: netVal }
                });
            }
        }

        res.json({
            success: true,
            totalAnalyzed: payslips.length,
            anomalyCount: anomalies.length,
            data: anomalies
        });

    } catch (error) {
        console.error("detectAnomalies error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Controller endpoint: Payroll Simulation
 * Simulates salary raise or structure change without persisting to database.
 */
const simulatePayroll = async (req, res) => {
    try {
        const { employeeId, proposedSalary, bonusPercentage, newAllowance } = req.body;

        if (!employeeId || proposedSalary === undefined) {
            return res.status(400).json({ success: false, message: "employeeId and proposedSalary are required" });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        let contract = await Contract.findOne({ employee: employeeId, status: "ACTIVE" }).populate({
            path: "salaryStructure",
            populate: { path: "rules" }
        });

        if (!contract) {
            contract = await Contract.findOne({ employee: employeeId });
        }

        const baseSalary = parseFloat(proposedSalary) || 60000;
        const bonusPct = parseFloat(bonusPercentage || 0);
        const extraAllowance = parseFloat(newAllowance || 0);

        // Compute simulated earnings & deductions using standard structure rules
        let basic = baseSalary * 0.50; // 50% Basic
        let hra = baseSalary * 0.20;   // 20% HRA
        let bonus = (baseSalary * bonusPct) / 100;
        let gross = basic + hra + bonus + extraAllowance;

        let tax = gross > 50000 ? gross * 0.10 : gross * 0.05;
        let pf = basic * 0.12;
        let totalDeductions = tax + pf;
        let simulatedNet = gross - totalDeductions;

        // Current contract baseline comparison
        const currentBase = contract?.salary || 50000;
        const currentGross = currentBase * 0.9;
        const currentNet = currentGross * 0.85;

        const empName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.name || "Employee";

        res.json({
            success: true,
            simulation: {
                employee: { id: employee._id, name: empName },
                baseline: {
                    contractSalary: currentBase,
                    estimatedNet: Math.round(currentNet)
                },
                projected: {
                    proposedContractSalary: baseSalary,
                    simulatedGross: Math.round(gross),
                    simulatedDeductions: Math.round(totalDeductions),
                    simulatedNet: Math.round(simulatedNet),
                    netDifference: Math.round(simulatedNet - currentNet),
                    percentageIncrease: currentNet > 0 ? (((simulatedNet - currentNet) / currentNet) * 100).toFixed(1) : "0.0"
                },
                breakdown: [
                    { rule: "BASIC (50%)", amount: Math.round(basic), type: "EARNING" },
                    { rule: "HRA (20%)", amount: Math.round(hra), type: "EARNING" },
                    { rule: "Bonus Allowance", amount: Math.round(bonus), type: "EARNING" },
                    { rule: "Additional Allowance", amount: Math.round(extraAllowance), type: "EARNING" },
                    { rule: "Income Tax (Est)", amount: Math.round(tax), type: "DEDUCTION" },
                    { rule: "PF Contribution (12%)", amount: Math.round(pf), type: "DEDUCTION" }
                ]
            }
        });

    } catch (error) {
        console.error("simulatePayroll error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    explainPayslip,
    detectAnomalies,
    simulatePayroll
};
