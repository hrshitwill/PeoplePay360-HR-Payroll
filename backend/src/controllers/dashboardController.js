const Employee = require("../models/Employee");
const Contract = require("../models/Contract");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Payrun = require("../models/Payrun");
const Payslip = require("../models/Payslip");
const TimeOffAllocation = require("../models/TimeOffAllocation");

const getDashboard = async (req, res) => {
    try {
        const { periodStart, periodEnd, department, employeeType } = req.query;

        // Build filters
        const employeeFilter = {};
        if (department) employeeFilter.department = department;
        if (employeeType) employeeFilter.employeeType = employeeType;

        const dateFilter = {};
        if (periodStart) dateFilter.$gte = new Date(periodStart);
        if (periodEnd) dateFilter.$lte = new Date(periodEnd);

        // Get employees
        const employees = await Employee.find(employeeFilter);
        const employeeIds = employees.map(e => e._id);

        const totalEmployees = employees.length;
        const activeEmployees = employees.filter(e => e.status === "ACTIVE").length;

        // Get employee type breakdown
        const employeeTypes = {};
        employees.forEach(e => {
            employeeTypes[e.employeeType] = (employeeTypes[e.employeeType] || 0) + 1;
        });

        // Get contracts
        const contractFilter = { employee: { $in: employeeIds } };
        const contracts = await Contract.find(contractFilter);
        const activeContracts = contracts.filter(c => c.status === "ACTIVE").length;
        const expiringContracts = contracts.filter(c => {
            if (!c.endDate) return false;
            const daysUntilExpiry = (new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24);
            return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        }).length;

        // Get payslips for period
        const payslipFilter = { employee: { $in: employeeIds } };
        if (periodStart || periodEnd) {
            if (periodStart) payslipFilter.periodStart = { $gte: new Date(periodStart) };
            if (periodEnd) payslipFilter.periodEnd = { $lte: new Date(periodEnd) };
        }

        const payslips = await Payslip.find(payslipFilter).populate("employee");
        const totalNetSalary = payslips.reduce((sum, p) => sum + p.net, 0);
        const totalGrossSalary = payslips.reduce((sum, p) => sum + p.gross, 0);
        const avgSalary = payslips.length > 0
            ? Math.round(totalNetSalary / payslips.length)
            : 0;

        // Salary by department
        const salaryByDepartment = {};
        payslips.forEach(p => {
            const dept = p.employee?.department || "Unknown";
            if (!salaryByDepartment[dept]) {
                salaryByDepartment[dept] = { gross: 0, net: 0, count: 0 };
            }
            salaryByDepartment[dept].gross += p.gross;
            salaryByDepartment[dept].net += p.net;
            salaryByDepartment[dept].count += 1;
        });

        // Department headcount with salary
        const departmentBreakdown = {};
        employees.forEach(e => {
            const dept = e.department || "Unknown";
            if (!departmentBreakdown[dept]) {
                departmentBreakdown[dept] = { headcount: 0, totalSalary: 0 };
            }
            departmentBreakdown[dept].headcount += 1;
        });
        // Merge salary data
        Object.keys(salaryByDepartment).forEach(dept => {
            if (departmentBreakdown[dept]) {
                departmentBreakdown[dept].totalSalary = salaryByDepartment[dept].net;
            }
        });

        // Get attendance data
        const attendanceFilter = { employee: { $in: employeeIds } };
        if (periodStart || periodEnd) {
            attendanceFilter.date = {};
            if (periodStart) attendanceFilter.date.$gte = new Date(periodStart);
            if (periodEnd) attendanceFilter.date.$lte = new Date(periodEnd);
        }

        const attendances = await Attendance.find(attendanceFilter);
        const presentCount = attendances.filter(a => a.status === "PRESENT").length;
        const absentCount = attendances.filter(a => a.status === "ABSENT").length;
        const lateCount = attendances.filter(a => a.status === "LATE").length;
        const halfDayCount = attendances.filter(a => a.status === "HALF_DAY").length;
        const onLeaveCount = attendances.filter(a => a.status === "ON_LEAVE").length;
        const totalOvertime = attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
        const missingCheckouts = attendances.filter(a => a.checkIn && !a.checkOut).length;
        const manualEdits = attendances.filter(a => a.isManualCorrection).length;
        const attendanceCoverage = totalEmployees > 0
            ? Math.round((attendances.length / totalEmployees) * 100)
            : 0;

        // Get leave data
        const leaveFilter = { employee: { $in: employeeIds } };
        const leaves = await Leave.find(leaveFilter);
        const approvedLeaves = leaves.filter(l => l.status === "APPROVED");
        const pendingLeaves = leaves.filter(l => l.status === "PENDING");
        const totalApprovedDays = approvedLeaves.reduce((sum, l) => sum + l.days, 0);

        // Get allocations
        const allocations = await TimeOffAllocation.find({
            employee: { $in: employeeIds },
            status: "APPROVED"
        }).populate("timeOffType");
        const totalAllocatedDays = allocations.reduce((sum, a) => sum + a.numberOfDays, 0);
        const totalRemainingDays = allocations.reduce((sum, a) => sum + a.remaining, 0);

        // Get payruns
        const payrunFilter = {};
        if (periodStart || periodEnd) {
            if (periodStart) payrunFilter.periodStart = { $gte: new Date(periodStart) };
            if (periodEnd) payrunFilter.periodEnd = { $lte: new Date(periodEnd) };
        }

        const payruns = await Payrun.find(payrunFilter);
        const payrunsByStatus = {
            DRAFT: payruns.filter(p => p.status === "DRAFT").length,
            COMPUTED: payruns.filter(p => p.status === "COMPUTED").length,
            VALIDATED: payruns.filter(p => p.status === "VALIDATED").length,
            PAID: payruns.filter(p => p.status === "PAID").length
        };

        // Monthly net salary trends
        const monthlyTrends = {};
        payslips.forEach(p => {
            const monthKey = new Date(p.periodStart).toISOString().slice(0, 7);
            if (!monthlyTrends[monthKey]) {
                monthlyTrends[monthKey] = { net: 0, gross: 0, count: 0 };
            }
            monthlyTrends[monthKey].net += p.net;
            monthlyTrends[monthKey].gross += p.gross;
            monthlyTrends[monthKey].count += 1;
        });

        // Warnings/Alerts
        const warnings = [];

        // Employees without bank details
        const noBankAccount = employees.filter(e => !e.bankAccount);
        if (noBankAccount.length > 0) {
            warnings.push({
                type: "MISSING_INFO",
                message: `${noBankAccount.length} employee(s) missing bank account details`,
                severity: "WARNING"
            });
        }

        // Employees without active contracts
        const employeesWithContracts = new Set(
            contracts.filter(c => c.status === "ACTIVE").map(c => c.employee.toString())
        );
        const noContract = employees.filter(
            e => e.status === "ACTIVE" && !employeesWithContracts.has(e._id.toString())
        );
        if (noContract.length > 0) {
            warnings.push({
                type: "MISSING_CONTRACT",
                message: `${noContract.length} active employee(s) without active contracts`,
                severity: "CRITICAL"
            });
        }

        // Expiring contracts
        if (expiringContracts > 0) {
            warnings.push({
                type: "EXPIRING_CONTRACT",
                message: `${expiringContracts} contract(s) expiring within 30 days`,
                severity: "WARNING"
            });
        }

        // Draft payruns
        if (payrunsByStatus.DRAFT > 0) {
            warnings.push({
                type: "DRAFT_PAYRUN",
                message: `${payrunsByStatus.DRAFT} payrun(s) still in DRAFT status`,
                severity: "INFO"
            });
        }

        // Missing checkouts
        if (missingCheckouts > 0) {
            warnings.push({
                type: "MISSING_CHECKOUT",
                message: `${missingCheckouts} attendance record(s) with missing check-out`,
                severity: "WARNING"
            });
        }

        // Pending leave requests
        if (pendingLeaves.length > 0) {
            warnings.push({
                type: "PENDING_LEAVES",
                message: `${pendingLeaves.length} leave request(s) pending approval`,
                severity: "INFO"
            });
        }

        // Get unique departments list
        const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

        res.json({
            success: true,
            data: {
                kpis: {
                    totalNetSalary: Math.round(totalNetSalary * 100) / 100,
                    totalGrossSalary: Math.round(totalGrossSalary * 100) / 100,
                    payslipsGenerated: payslips.length,
                    avgSalary,
                    totalApprovedTimeOff: totalApprovedDays,
                    totalEmployees,
                    activeEmployees
                },
                attendance: {
                    present: presentCount,
                    absent: absentCount,
                    late: lateCount,
                    halfDay: halfDayCount,
                    onLeave: onLeaveCount,
                    totalOvertime: Math.round(totalOvertime * 100) / 100,
                    missingCheckouts,
                    manualEdits,
                    coverage: attendanceCoverage
                },
                timeOff: {
                    approvedDays: totalApprovedDays,
                    pendingRequests: pendingLeaves.length,
                    totalAllocated: totalAllocatedDays,
                    totalRemaining: totalRemainingDays
                },
                salaryByDepartment,
                departmentBreakdown,
                monthlyTrends,
                payrunsByStatus,
                employeeTypes,
                warnings,
                departments
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
    getDashboard
};
