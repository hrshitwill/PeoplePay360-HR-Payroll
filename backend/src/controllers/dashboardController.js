const Employee = require("../models/Employee");
const Contract = require("../models/Contract");
const Payrun = require("../models/Payrun");
const Payslip = require("../models/Payslip");
const Attendance = require("../models/Attendance");
const TimeOffRequest = require("../models/TimeOffRequest");
const TimeOffAllocation = require("../models/TimeOffAllocation");

const getDashboardMetrics = async (req, res) => {
    try {
        const { department, employeeType, period } = req.query;

        // Base filters
        const empQuery = { status: "ACTIVE" };
        if (department && department !== "ALL") empQuery.department = department;
        if (employeeType && employeeType !== "ALL") empQuery.employmentType = employeeType;

        const employees = await Employee.find(empQuery);
        const empIds = employees.map((e) => e._id);

        // 1. Payslips & Salary Metrics
        const payslipQuery = { employee: { $in: empIds } };
        if (period && period !== "ALL") {
            const now = new Date();
            if (period === "CURRENT_MONTH") {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                payslipQuery.periodStart = { $gte: startOfMonth };
            } else if (period === "LAST_3_MONTHS") {
                const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                payslipQuery.periodStart = { $gte: threeMonthsAgo };
            }
        }

        const payslips = await Payslip.find(payslipQuery).populate("employee");

        const totalNetPaid = payslips
            .filter((p) => p.status === "PAID")
            .reduce((sum, p) => sum + (p.netSalary || 0), 0);

        const totalNetAll = payslips.reduce((sum, p) => sum + (p.netSalary || 0), 0);
        const totalGrossAll = payslips.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
        const totalDeductionsAll = payslips.reduce((sum, p) => sum + (p.totalDeductions || 0), 0);
        const payslipsCount = payslips.length;
        const avgSalary = payslipsCount > 0 ? Number((totalNetAll / payslipsCount).toFixed(2)) : 0;

        // 2. Attendance Metrics
        const attendanceQuery = { employee: { $in: empIds } };
        const attendanceRecords = await Attendance.find(attendanceQuery);
        const totalAttendance = attendanceRecords.length;
        const presentCount = attendanceRecords.filter((a) => a.status === "PRESENT").length;
        const lateCount = attendanceRecords.filter((a) => a.status === "LATE").length;
        const absentCount = attendanceRecords.filter((a) => a.status === "ABSENT").length;
        const overtimeCount = attendanceRecords.filter((a) => a.status === "OVERTIME").length;
        const exceptionsCount = attendanceRecords.filter(
            (a) => a.status === "MISSING_CHECKOUT" || a.isManuallyCorrected
        ).length;

        const attendanceHealth = totalAttendance > 0
            ? Number(((presentCount + overtimeCount) / totalAttendance * 100).toFixed(1))
            : 100;

        // 3. Time Off Metrics
        const approvedLeaves = await TimeOffRequest.find({
            employee: { $in: empIds },
            status: "APPROVED"
        });
        const pendingLeaves = await TimeOffRequest.find({
            employee: { $in: empIds },
            status: "PENDING"
        }).populate("employee", "firstName lastName employeeId department");

        const approvedLeaveDays = approvedLeaves.reduce((sum, l) => sum + (l.duration || 0), 0);

        // 4. Department Breakdown (Headcount, Active Contracts, Salary)
        const allDepts = ["Engineering", "Sales", "Human Resources", "Finance", "Operations", "Marketing"];
        const deptBreakdown = await Promise.all(
            allDepts.map(async (deptName) => {
                const deptEmps = await Employee.find({ department: deptName, status: "ACTIVE" });
                const deptEmpIds = deptEmps.map((e) => e._id);
                const deptContracts = await Contract.find({ employee: { $in: deptEmpIds }, status: "ACTIVE" });
                const totalDeptSalary = deptContracts.reduce((sum, c) => sum + (c.salary || 0), 0);

                return {
                    department: deptName,
                    headcount: deptEmps.length,
                    activeContracts: deptContracts.length,
                    totalSalaryCost: totalDeptSalary,
                    avgWage: deptContracts.length > 0 ? Number((totalDeptSalary / deptContracts.length).toFixed(2)) : 0
                };
            })
        );

        // 5. Monthly Net Salary Trends
        // Aggregate payruns / payslips by month
        const monthlyTrends = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentYear = new Date().getFullYear();

        for (let m = 0; m < 12; m++) {
            const start = new Date(currentYear, m, 1);
            const end = new Date(currentYear, m + 1, 0, 23, 59, 59);

            const mPayslips = await Payslip.find({
                periodStart: { $gte: start, $lte: end }
            });

            if (mPayslips.length > 0) {
                const mNet = mPayslips.reduce((sum, p) => sum + (p.netSalary || 0), 0);
                const mGross = mPayslips.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
                monthlyTrends.push({
                    month: `${monthNames[m]} ${currentYear}`,
                    netSalary: mNet,
                    grossSalary: mGross,
                    payslipsCount: mPayslips.length
                });
            }
        }

        // If monthlyTrends is empty, add at least current month and previous month from existing payslips
        if (monthlyTrends.length === 0) {
            monthlyTrends.push({
                month: `${monthNames[new Date().getMonth()]} ${currentYear}`,
                netSalary: totalNetAll,
                grossSalary: totalGrossAll,
                payslipsCount
            });
        }

        // 6. Operational Alerts
        const missingBankEmployees = await Employee.find({
            status: "ACTIVE",
            $or: [
                { "bankDetails.accountNumber": { $in: ["", null] } },
                { "bankDetails.bankName": { $in: ["", null] } }
            ]
        }).select("firstName lastName employeeId department");

        const expiringContracts = await Contract.find({
            status: "ACTIVE",
            endDate: {
                $ne: null,
                $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // within 30 days
            }
        }).populate("employee", "firstName lastName employeeId department");

        const unapprovedAllocations = await TimeOffAllocation.find({
            status: "DRAFT"
        }).populate("employee", "firstName lastName employeeId");

        const alerts = [
            ...missingBankEmployees.map((e) => ({
                id: `bank-${e._id}`,
                type: "BANK_MISSING",
                severity: "WARNING",
                title: "Missing Bank Details",
                message: `${e.firstName} ${e.lastName} (${e.employeeId}) lacks complete bank account details for payroll direct deposit.`,
                department: e.department
            })),
            ...expiringContracts.map((c) => ({
                id: `contract-${c._id}`,
                type: "CONTRACT_EXPIRING",
                severity: "INFO",
                title: "Contract Expiring Soon",
                message: `Contract for ${c.employee?.firstName} ${c.employee?.lastName} expires on ${new Date(c.endDate).toLocaleDateString()}.`,
                department: c.employee?.department
            })),
            ...pendingLeaves.map((l) => ({
                id: `leave-${l._id}`,
                type: "LEAVE_PENDING",
                severity: "WARNING",
                title: "Pending Leave Request",
                message: `${l.employee?.firstName} ${l.employee?.lastName} requested ${l.duration} days time off.`,
                department: l.employee?.department
            })),
            ...unapprovedAllocations.map((a) => ({
                id: `alloc-${a._id}`,
                type: "ALLOCATION_DRAFT",
                severity: "INFO",
                title: "Draft Leave Allocation",
                message: `Allocation of ${a.allocatedUnits} units for ${a.employee?.firstName} ${a.employee?.lastName} is pending approval.`,
                department: a.employee?.department
            }))
        ];

        res.json({
            success: true,
            data: {
                kpis: {
                    totalNetSalaryPaid: totalNetPaid,
                    totalNetSalaryAll: totalNetAll,
                    totalGrossSalary: totalGrossAll,
                    totalDeductions: totalDeductionsAll,
                    payslipsGenerated: payslipsCount,
                    averageSalary: avgSalary,
                    approvedTimeOffDays: approvedLeaveDays,
                    attendanceHealth
                },
                attendanceBreakdown: {
                    total: totalAttendance,
                    present: presentCount,
                    late: lateCount,
                    absent: absentCount,
                    overtime: overtimeCount,
                    exceptions: exceptionsCount
                },
                charts: {
                    salaryCostByDepartment: deptBreakdown.filter((d) => d.headcount > 0 || d.totalSalaryCost > 0),
                    monthlyNetSalaryTrends: monthlyTrends
                },
                departmentBreakdown: deptBreakdown,
                operationalAlerts: alerts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboardMetrics
};
