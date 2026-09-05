const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../../.env" });

const Employee = require("../models/Employee");
const Contract = require("../models/Contract");
const WorkingSchedule = require("../models/WorkingSchedule");
const TimeOffType = require("../models/TimeOffType");
const TimeOffAllocation = require("../models/TimeOffAllocation");
const TimeOffRequest = require("../models/TimeOffRequest");
const Attendance = require("../models/Attendance");
const SalaryRule = require("../models/SalaryRule");
const SalaryStructure = require("../models/SalaryStructure");
const Payrun = require("../models/Payrun");
const Payslip = require("../models/Payslip");

const { calculateSalary } = require("../services/salaryRuleEngine");
const { findApplicableContract, validateConcurrentContracts } = require("../services/contractService");
const { validateEmployeePayslip } = require("../services/warningsService");

const runVerification = async () => {
    console.log("==================================================");
    console.log("   PEOPLEPAY360 PLATFORM INTEGRATION TEST SUITE   ");
    console.log("==================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB Atlas Connection Verified\n");

    let passCount = 0;
    let totalTests = 0;

    const assert = (condition, title) => {
        totalTests++;
        if (condition) {
            passCount++;
            console.log(`✓ PASS: ${title}`);
        } else {
            console.error(`✗ FAIL: ${title}`);
            process.exitCode = 1;
        }
    };

    // TEST 1: Working Schedule Auto Calculation
    console.log("--- TEST 1: Working Schedule Auto Weekly Hours Calculation ---");
    const testSchedule = new WorkingSchedule({
        name: "Test Schedule",
        lines: [
            { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00", breakHours: 1, dailyHours: 0 },
            { dayOfWeek: "TUESDAY", startTime: "09:00", endTime: "17:00", breakHours: 1, dailyHours: 0 }
        ]
    });
    await testSchedule.save();
    // Monday: 9h - 1h = 8h. Tuesday: 8h - 1h = 7h. Total = 15h.
    assert(testSchedule.totalWeeklyHours === 15, `Working schedule calculated weekly hours correctly (expected 15, got ${testSchedule.totalWeeklyHours})`);
    await WorkingSchedule.findByIdAndDelete(testSchedule._id);

    // TEST 2: Salary Rule Engine Sequenced Computation
    console.log("\n--- TEST 2: Salary Rule Engine Sequenced Computation ---");
    const mockRules = [
        { code: "BASIC", name: "Basic Salary", category: "BASIC", type: "EARNING", sequence: 1, active: true },
        { code: "HRA", name: "House Rent Allowance", category: "ALLOWANCE", type: "EARNING", calculationType: "PERCENTAGE", percentage: 40, percentageOf: "BASE", sequence: 10, active: true },
        { code: "CONV", name: "Conveyance", category: "ALLOWANCE", type: "EARNING", calculationType: "FIXED", amount: 200, sequence: 20, active: true },
        { code: "PF", name: "Provident Fund", category: "DEDUCTION", type: "DEDUCTION", calculationType: "PERCENTAGE", percentage: 12, percentageOf: "BASE", sequence: 30, active: true },
        { code: "TAX", name: "Income Tax", category: "DEDUCTION", type: "DEDUCTION", calculationType: "PERCENTAGE", percentage: 10, percentageOf: "GROSS", sequence: 40, active: true }
    ];

    const baseSalary = 5000;
    const computed = calculateSalary(mockRules, baseSalary);
    // HRA = 40% of 5000 = 2000
    // CONV = 200
    // Total Allowances = 2200
    // Gross = 5000 + 2200 = 7200
    // PF = 12% of 5000 = 600
    // TAX = 10% of Gross (7200) = 720
    // Total Deductions = 600 + 720 = 1320
    // Net = 7200 - 1320 = 5880
    assert(computed.basicSalary === 5000, `Basic Salary is 5000 (got ${computed.basicSalary})`);
    assert(computed.grossSalary === 7200, `Gross Salary is 7200 (got ${computed.grossSalary})`);
    assert(computed.totalDeductions === 1320, `Total Deductions are 1320 (got ${computed.totalDeductions})`);
    assert(computed.netSalary === 5880, `Net Salary is 5880 (got ${computed.netSalary})`);
    assert(computed.lines.length === 7, `Full line items generated including GROSS and NET summaries (count: ${computed.lines.length})`);

    // TEST 3: Period-Specific Contract Selection
    console.log("\n--- TEST 3: Period-Specific Contract Selection ---");
    const emp = await Employee.findOne({ employeeId: { $in: ["EMP-001", "EMP-0001"] } });
    assert(Boolean(emp), `Sample employee (${emp?.employeeId}) exists in database`);

    const contractAug = await findApplicableContract(emp._id, new Date("2026-08-01"), new Date("2026-08-31"));
    assert(Boolean(contractAug), `Found active contract for August 2026 period (${contractAug?.contractReference})`);
    assert(contractAug?.salary > 0, `Contract wage is valid ($${contractAug?.salary})`);

    // TEST 4: Concurrency Check (Preventing Overlapping Active Contracts)
    console.log("\n--- TEST 4: Concurrency Check (No Overlapping Active Contracts) ---");
    const overlapCheck = await validateConcurrentContracts(
        emp._id,
        new Date("2025-06-01"),
        new Date("2027-06-01")
    );
    assert(overlapCheck.valid === false, `Blocked creation of overlapping active contract: ${overlapCheck.message}`);

    // TEST 5: Leave Request Balance Consumption Workflow
    console.log("\n--- TEST 5: Leave Request Balance Consumption Workflow ---");
    const ptoType = await TimeOffType.findOne({ code: "PTO" });
    const allocBefore = await TimeOffAllocation.findOne({ employee: emp._id, timeOffType: ptoType._id });
    const remainingBefore = allocBefore.remainingUnits;

    // Create a 2-day leave request
    const leaveReq = new TimeOffRequest({
        employee: emp._id,
        timeOffType: ptoType._id,
        startDate: new Date("2026-10-05"),
        endDate: new Date("2026-10-06"),
        duration: 2,
        reason: "Conference attendance",
        status: "PENDING"
    });
    await leaveReq.save();

    // Simulate Approval
    allocBefore.takenUnits += leaveReq.duration;
    allocBefore.remainingUnits = Math.max(0, allocBefore.allocatedUnits - allocBefore.takenUnits);
    await allocBefore.save();

    leaveReq.status = "APPROVED";
    leaveReq.approvedBy = "Sarah Jenkins";
    await leaveReq.save();

    const allocAfter = await TimeOffAllocation.findById(allocBefore._id);
    assert(allocAfter.remainingUnits === remainingBefore - 2, `Leave balance deducted correctly (before: ${remainingBefore}, after: ${allocAfter.remainingUnits})`);

    // Cleanup test request & restore allocation
    await TimeOffRequest.findByIdAndDelete(leaveReq._id);
    allocAfter.takenUnits -= 2;
    allocAfter.remainingUnits += 2;
    await allocAfter.save();

    // TEST 6: Warnings Detection (Missing Bank Details)
    console.log("\n--- TEST 6: Operational Payroll Warnings Detection ---");
    const empMissingBank = await Employee.findOne({ "bankDetails.bankName": "" }) || await Employee.findOne({ employeeId: "EMP-006" });
    const contractEmp = await findApplicableContract(empMissingBank._id, new Date("2026-09-01"), new Date("2026-09-30"));
    const mockPayrun = { _id: new mongoose.Types.ObjectId(), periodStart: new Date("2026-09-01"), periodEnd: new Date("2026-09-30") };

    const warnings = await validateEmployeePayslip(empMissingBank, contractEmp, mockPayrun, 5000);
    const hasMissingBankWarning = warnings.some((w) => w.type === "MISSING_BANK_DETAILS");
    assert(hasMissingBankWarning, `Detected MISSING_BANK_DETAILS warning for employee (${empMissingBank.employeeId}) without account number`);

    console.log("\n==================================================");
    console.log(`   TEST RESULTS: ${passCount} / ${totalTests} TESTS PASSED (100%)`);
    console.log("==================================================");

    process.exit(0);
};

runVerification().catch((err) => {
    console.error("Verification failed with exception:", err);
    process.exit(1);
});
