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
const User = require("../models/User");
const { calculateSalary } = require("../services/salaryRuleEngine");

const seedDatabase = async () => {
    try {
        console.log("Connecting to database for seeding...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas.");

        // Clear existing collections
        console.log("Clearing existing collections...");
        await Promise.all([
            Employee.deleteMany({}),
            Contract.deleteMany({}),
            WorkingSchedule.deleteMany({}),
            TimeOffType.deleteMany({}),
            TimeOffAllocation.deleteMany({}),
            TimeOffRequest.deleteMany({}),
            Attendance.deleteMany({}),
            SalaryRule.deleteMany({}),
            SalaryStructure.deleteMany({}),
            Payrun.deleteMany({}),
            Payslip.deleteMany({}),
            User.deleteMany({})
        ]);

        console.log("Creating Working Schedules...");
        const scheduleStandard = new WorkingSchedule({
            name: "Standard 40h Schedule",
            type: "STANDARD",
            description: "Monday to Friday 9:00 AM to 6:00 PM with 1 hour lunch break",
            totalWeeklyHours: 40,
            lines: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map((day) => ({
                dayOfWeek: day,
                startTime: "09:00",
                endTime: "18:00",
                breakHours: 1,
                dailyHours: 8
            }))
        });
        await scheduleStandard.save();

        const scheduleFlex = new WorkingSchedule({
            name: "Flexible Tech 35h Schedule",
            type: "FLEXIBLE",
            description: "Core hours with 7 hours daily expected",
            totalWeeklyHours: 35,
            lines: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map((day) => ({
                dayOfWeek: day,
                startTime: "10:00",
                endTime: "18:00",
                breakHours: 1,
                dailyHours: 7
            }))
        });
        await scheduleFlex.save();

        console.log("Creating Salary Rules...");
        const ruleBasic = await SalaryRule.create({
            name: "Basic Salary",
            code: "BASIC",
            sequence: 1,
            category: "BASIC",
            type: "EARNING",
            calculationType: "FIXED",
            description: "Fundamental base pay established in contract"
        });

        const ruleHra = await SalaryRule.create({
            name: "House Rent Allowance (HRA)",
            code: "HRA",
            sequence: 10,
            category: "ALLOWANCE",
            type: "EARNING",
            calculationType: "PERCENTAGE",
            percentage: 40,
            percentageOf: "BASE",
            description: "40% of base salary for housing subsidy"
        });

        const ruleConv = await SalaryRule.create({
            name: "Conveyance Allowance",
            code: "CONV",
            sequence: 20,
            category: "ALLOWANCE",
            type: "EARNING",
            calculationType: "FIXED",
            amount: 250,
            description: "Fixed monthly transit and commute stipend"
        });

        const ruleSplAlw = await SalaryRule.create({
            name: "Special Allowance",
            code: "SPL_ALW",
            sequence: 30,
            category: "ALLOWANCE",
            type: "EARNING",
            calculationType: "FIXED",
            amount: 400,
            description: "Supplemental role-based allowance"
        });

        const ruleMedAlw = await SalaryRule.create({
            name: "Medical Allowance",
            code: "MED_ALW",
            sequence: 40,
            category: "ALLOWANCE",
            type: "EARNING",
            calculationType: "FIXED",
            amount: 150,
            description: "Fixed outpatient medical expenses allowance"
        });

        const rulePf = await SalaryRule.create({
            name: "Provident Fund (PF)",
            code: "PF",
            sequence: 60,
            category: "DEDUCTION",
            type: "DEDUCTION",
            calculationType: "PERCENTAGE",
            percentage: 12,
            percentageOf: "BASE",
            description: "12% statutory employee retirement contribution"
        });

        const ruleTax = await SalaryRule.create({
            name: "Income Tax Deduction",
            code: "TAX",
            sequence: 70,
            category: "DEDUCTION",
            type: "DEDUCTION",
            calculationType: "PERCENTAGE",
            percentage: 10,
            percentageOf: "GROSS",
            description: "10% estimated tax withholding on gross earnings"
        });

        const ruleHealthIns = await SalaryRule.create({
            name: "Health Insurance",
            code: "HEALTH_INS",
            sequence: 80,
            category: "DEDUCTION",
            type: "DEDUCTION",
            calculationType: "FIXED",
            amount: 120,
            description: "Comprehensive corporate healthcare premium"
        });

        console.log("Creating Salary Structures...");
        const regularStructure = await SalaryStructure.create({
            name: "Regular Corporate Structure",
            code: "REG_CORP_2026",
            description: "Standard salaried package with HRA, Conveyance, PF and Tax deductions",
            rules: [ruleBasic._id, ruleHra._id, ruleConv._id, ruleSplAlw._id, ruleMedAlw._id, rulePf._id, ruleTax._id, ruleHealthIns._id]
        });

        const contractorStructure = await SalaryStructure.create({
            name: "Consultant / Contractor Structure",
            code: "CONTRACTOR_2026",
            description: "Direct wage compensation with standard tax withholding",
            rules: [ruleBasic._id, ruleTax._id]
        });

        console.log("Creating Time Off Types...");
        const ptoType = await TimeOffType.create({
            name: "Paid Time Off (PTO)",
            code: "PTO",
            unit: "DAYS",
            requiresAllocation: true,
            isPaid: true,
            color: "#2563EB",
            description: "General personal leave and vacation"
        });

        const sickType = await TimeOffType.create({
            name: "Sick Leave",
            code: "SICK",
            unit: "DAYS",
            requiresAllocation: true,
            isPaid: true,
            color: "#DC2626",
            description: "Health and medical recovery time off"
        });

        const unpaidType = await TimeOffType.create({
            name: "Unpaid Time Off",
            code: "UNPAID",
            unit: "DAYS",
            requiresAllocation: false,
            isPaid: false,
            color: "#6B7280",
            description: "Leave without pay"
        });

        console.log("Creating Employees...");
        const employeeData = [
            {
                employeeId: "EMP-001",
                firstName: "Alex",
                lastName: "Morgan",
                email: "alex.morgan@peoplepay360.com",
                phone: "+1 (555) 234-5678",
                department: "Engineering",
                jobTitle: "Lead Software Architect",
                employmentType: "FULL_TIME",
                joiningDate: new Date("2023-01-15"),
                status: "ACTIVE",
                workingSchedule: scheduleFlex._id,
                bankDetails: {
                    bankName: "Chase Bank",
                    accountNumber: "987654321098",
                    ifscRouting: "CHASUS33XXX",
                    accountHolderName: "Alex Morgan"
                },
                address: "450 Market St, San Francisco, CA"
            },
            {
                employeeId: "EMP-002",
                firstName: "Sarah",
                lastName: "Jenkins",
                email: "sarah.jenkins@peoplepay360.com",
                phone: "+1 (555) 345-6789",
                department: "Human Resources",
                jobTitle: "Head of People & Culture",
                employmentType: "FULL_TIME",
                joiningDate: new Date("2022-06-01"),
                status: "ACTIVE",
                workingSchedule: scheduleStandard._id,
                bankDetails: {
                    bankName: "Bank of America",
                    accountNumber: "123456789012",
                    ifscRouting: "BOFAUS3NXXX",
                    accountHolderName: "Sarah Jenkins"
                },
                address: "120 Pine Blvd, San Jose, CA"
            },
            {
                employeeId: "EMP-003",
                firstName: "David",
                lastName: "Kim",
                email: "david.kim@peoplepay360.com",
                phone: "+1 (555) 456-7890",
                department: "Finance",
                jobTitle: "Senior Financial Analyst",
                employmentType: "FULL_TIME",
                joiningDate: new Date("2023-04-10"),
                status: "ACTIVE",
                workingSchedule: scheduleStandard._id,
                bankDetails: {
                    bankName: "Wells Fargo",
                    accountNumber: "556677889900",
                    ifscRouting: "WFBIUS6SXXX",
                    accountHolderName: "David Kim"
                },
                address: "88 University Ave, Palo Alto, CA"
            },
            {
                employeeId: "EMP-004",
                firstName: "Elena",
                lastName: "Rostova",
                email: "elena.rostova@peoplepay360.com",
                phone: "+1 (555) 567-8901",
                department: "Finance",
                jobTitle: "Payroll Operations Director",
                employmentType: "FULL_TIME",
                joiningDate: new Date("2021-11-15"),
                status: "ACTIVE",
                workingSchedule: scheduleStandard._id,
                bankDetails: {
                    bankName: "Citibank",
                    accountNumber: "443322110099",
                    ifscRouting: "CITIUS33XXX",
                    accountHolderName: "Elena Rostova"
                },
                address: "710 Broadway, Oakland, CA"
            },
            {
                employeeId: "EMP-005",
                firstName: "Marcus",
                lastName: "Vance",
                email: "marcus.vance@peoplepay360.com",
                phone: "+1 (555) 678-9012",
                department: "Sales",
                jobTitle: "Enterprise Account Executive",
                employmentType: "FULL_TIME",
                joiningDate: new Date("2023-08-20"),
                status: "ACTIVE",
                workingSchedule: scheduleStandard._id,
                bankDetails: {
                    bankName: "Silicon Valley Bank",
                    accountNumber: "778899112233",
                    ifscRouting: "SVBKUS6SXXX",
                    accountHolderName: "Marcus Vance"
                },
                address: "300 California St, San Francisco, CA"
            },
            {
                employeeId: "EMP-006",
                firstName: "Priya",
                lastName: "Patel",
                email: "priya.patel@peoplepay360.com",
                phone: "+1 (555) 789-0123",
                department: "Engineering",
                jobTitle: "Full Stack Engineer",
                employmentType: "FULL_TIME",
                joiningDate: new Date("2024-02-01"),
                status: "ACTIVE",
                workingSchedule: scheduleFlex._id,
                // Missing bank details intentionally to test operational warnings!
                bankDetails: {
                    bankName: "",
                    accountNumber: "",
                    ifscRouting: "",
                    accountHolderName: ""
                },
                address: "15 Mission Bay Blvd, San Francisco, CA"
            },
            {
                employeeId: "EMP-007",
                firstName: "Jordan",
                lastName: "Reed",
                email: "jordan.reed@peoplepay360.com",
                phone: "+1 (555) 890-1234",
                department: "Operations",
                jobTitle: "Operations Coordinator",
                employmentType: "CONTRACT",
                joiningDate: new Date("2024-05-15"),
                status: "ACTIVE",
                workingSchedule: scheduleStandard._id,
                bankDetails: {
                    bankName: "Capital One",
                    accountNumber: "665544332211",
                    ifscRouting: "NFBKUS33XXX",
                    accountHolderName: "Jordan Reed"
                },
                address: "92 Fremont St, Sunnyvale, CA"
            }
        ];

        const createdEmployees = [];
        for (const emp of employeeData) {
            const doc = await Employee.create(emp);
            createdEmployees.push(doc);
        }

        console.log("Creating Contracts (Active and Historical)...");
        // Historical expired contract for Alex Morgan
        await Contract.create({
            contractReference: "CNT-2023-001",
            employee: createdEmployees[0]._id,
            contractType: "FULL_TIME",
            jobPosition: "Senior Software Engineer",
            department: "Engineering",
            startDate: new Date("2023-01-15"),
            endDate: new Date("2024-01-14"),
            salary: 6500,
            salaryStructure: regularStructure._id,
            workingSchedule: scheduleFlex._id,
            status: "EXPIRED",
            notes: "Previous year initial contract"
        });

        // Current active contracts for all employees
        const salaries = [8500, 7200, 6800, 8000, 6200, 5800, 4800];
        const activeContracts = [];

        for (let i = 0; i < createdEmployees.length; i++) {
            const isContractor = createdEmployees[i].employmentType === "CONTRACT";
            // Contract for Jordan Reed expiring within 25 days to trigger operational alert!
            const endDate = i === 6 ? new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) : null;

            const contract = await Contract.create({
                contractReference: `CNT-2024-00${i + 2}`,
                employee: createdEmployees[i]._id,
                contractType: createdEmployees[i].employmentType,
                jobPosition: createdEmployees[i].jobTitle,
                department: createdEmployees[i].department,
                startDate: new Date("2024-01-15"),
                endDate,
                salary: salaries[i],
                salaryStructure: isContractor ? contractorStructure._id : regularStructure._id,
                workingSchedule: createdEmployees[i].workingSchedule,
                status: "ACTIVE",
                notes: "Current standard employment agreement"
            });
            activeContracts.push(contract);
        }

        console.log("Creating Time Off Allocations & Requests...");
        for (const emp of createdEmployees) {
            // PTO allocation
            const ptoAlloc = new TimeOffAllocation({
                name: "2026 Annual PTO Grant",
                employee: emp._id,
                timeOffType: ptoType._id,
                allocatedUnits: 20,
                takenUnits: 3,
                remainingUnits: 17,
                validityStartDate: new Date("2026-01-01"),
                validityEndDate: new Date("2026-12-31"),
                status: "APPROVED"
            });
            await ptoAlloc.save();

            // Sick leave allocation
            const sickAlloc = new TimeOffAllocation({
                name: "2026 Sick Leave Grant",
                employee: emp._id,
                timeOffType: sickType._id,
                allocatedUnits: 10,
                takenUnits: 1,
                remainingUnits: 9,
                validityStartDate: new Date("2026-01-01"),
                validityEndDate: new Date("2026-12-31"),
                status: "APPROVED"
            });
            await sickAlloc.save();
        }

        // Leave Requests (Approved and Pending)
        await TimeOffRequest.create({
            employee: createdEmployees[0]._id,
            timeOffType: ptoType._id,
            startDate: new Date("2026-08-10"),
            endDate: new Date("2026-08-12"),
            duration: 3,
            reason: "Summer family road trip",
            status: "APPROVED",
            approvedBy: "Sarah Jenkins",
            approvalDate: new Date("2026-08-01")
        });

        // Pending Request to test approval workflow in demo!
        await TimeOffRequest.create({
            employee: createdEmployees[4]._id, // Marcus Vance
            timeOffType: ptoType._id,
            startDate: new Date("2026-09-18"),
            endDate: new Date("2026-09-20"),
            duration: 3,
            reason: "Annual wellness leave",
            status: "PENDING"
        });

        console.log("Creating Attendance Records with exceptions...");
        const today = new Date();
        for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
            const date = new Date(today);
            date.setDate(date.getDate() - dayOffset);
            date.setHours(0, 0, 0, 0);

            for (let i = 0; i < createdEmployees.length; i++) {
                const emp = createdEmployees[i];
                let status = "PRESENT";
                let workedHours = 8;
                let checkIn = new Date(date);
                checkIn.setHours(9, 0, 0);
                let checkOut = new Date(date);
                checkOut.setHours(17, 30, 0);

                if (i === 4 && dayOffset === 1) {
                    // Marcus was late
                    status = "LATE";
                    checkIn.setHours(10, 45, 0);
                    workedHours = 6.75;
                } else if (i === 0 && dayOffset === 2) {
                    // Alex worked overtime
                    status = "OVERTIME";
                    checkOut.setHours(20, 0, 0);
                    workedHours = 10;
                } else if (i === 5 && dayOffset === 0) {
                    // Priya missing checkout
                    status = "MISSING_CHECKOUT";
                    checkOut = null;
                    workedHours = 0;
                }

                const attendance = new Attendance({
                    employee: emp._id,
                    date,
                    checkIn,
                    checkOut,
                    workedHours,
                    status,
                    isManuallyCorrected: i === 2 && dayOffset === 3,
                    correctionReason: i === 2 && dayOffset === 3 ? "Badge scanner malfunction at front lobby" : "",
                    correctedBy: i === 2 && dayOffset === 3 ? "Sarah Jenkins" : ""
                });
                await attendance.save();
            }
        }

        console.log("Creating Historical August 2026 Payrun & Payslips...");
        const augPayrun = new Payrun({
            name: "August 2026 Monthly Payroll Batch",
            payrunBatchNumber: "PR-202608-01",
            periodStart: new Date("2026-08-01"),
            periodEnd: new Date("2026-08-31"),
            salaryStructure: regularStructure._id,
            employees: createdEmployees.map((e) => e._id),
            status: "PAID",
            paidAt: new Date("2026-08-31T18:00:00Z"),
            sentAt: new Date("2026-08-31T19:00:00Z"),
            emailCount: createdEmployees.length
        });
        await augPayrun.save();

        const populatedRegularRules = await SalaryRule.find({ _id: { $in: regularStructure.rules } });

        let totalGross = 0;
        let totalDeductions = 0;
        let totalNet = 0;

        for (let i = 0; i < createdEmployees.length; i++) {
            const emp = createdEmployees[i];
            const contract = activeContracts[i];
            const baseSalary = contract.salary;

            const computed = calculateSalary(populatedRegularRules, baseSalary);
            totalGross += computed.grossSalary;
            totalDeductions += computed.totalDeductions;
            totalNet += computed.netSalary;

            await Payslip.create({
                payslipNumber: `PS-202608-00${i + 1}`,
                payrun: augPayrun._id,
                employee: emp._id,
                contract: contract._id,
                salaryStructure: regularStructure._id,
                periodStart: new Date("2026-08-01"),
                periodEnd: new Date("2026-08-31"),
                status: "PAID",
                workedDays: 22,
                totalWorkingDays: 22,
                lines: computed.lines,
                basicSalary: computed.basicSalary,
                totalAllowances: computed.totalAllowances,
                grossSalary: computed.grossSalary,
                totalDeductions: computed.totalDeductions,
                netSalary: computed.netSalary,
                emailStatus: "SENT",
                sentAt: new Date("2026-08-31T19:00:00Z"),
                paidAt: new Date("2026-08-31T18:00:00Z")
            });
        }

        augPayrun.totalGross = Number(totalGross.toFixed(2));
        augPayrun.totalDeductions = Number(totalDeductions.toFixed(2));
        augPayrun.totalNet = Number(totalNet.toFixed(2));
        console.log("Creating System Users for All Roles...");
        const usersData = [
            {
                name: "Admin User",
                email: "admin@peoplepay360.com",
                password: "password123",
                role: "ADMIN"
            },
            {
                name: "Sarah Jenkins (HR Manager)",
                email: "sarah.jenkins@peoplepay360.com",
                password: "password123",
                role: "HR_MANAGER",
                linkedEmployee: createdEmployees[1]._id
            },
            {
                name: "David Kim (HR Payroll User)",
                email: "david.kim@peoplepay360.com",
                password: "password123",
                role: "HR_PAYROLL_USER",
                linkedEmployee: createdEmployees[2]._id
            },
            {
                name: "Elena Rostova (Payroll Director)",
                email: "elena.rostova@peoplepay360.com",
                password: "password123",
                role: "HR_PAYROLL_MANAGER",
                linkedEmployee: createdEmployees[3]._id
            },
            {
                name: "Alex Morgan (Employee)",
                email: "alex.morgan@peoplepay360.com",
                password: "password123",
                role: "EMPLOYEE",
                linkedEmployee: createdEmployees[0]._id
            }
        ];

        for (const u of usersData) {
            await User.create({ ...u, status: "ACTIVE" });
        }

        console.log("Database seeded successfully with realistic enterprise data!");
        return { success: true, message: "Database seeded successfully" };
    } catch (error) {
        console.error("Seeding error:", error);
        throw error;
    }
};

// Run if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log("Seeding process finished.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Failed:", err);
            process.exit(1);
        });
}

module.exports = seedDatabase;
