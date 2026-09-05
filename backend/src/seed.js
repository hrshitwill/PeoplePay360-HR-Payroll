const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: __dirname + "/../.env" });
const connectDB = require("./config/db");

// Models
const Employee = require("./models/Employee");
const User = require("./models/User");
const WorkingSchedule = require("./models/WorkingSchedule");
const TimeOffType = require("./models/TimeOffType");
const TimeOffAllocation = require("./models/TimeOffAllocation");
const Contract = require("./models/Contract");
const SalaryStructure = require("./models/SalaryStructure");
const SalaryRule = require("./models/SalaryRule");
const Attendance = require("./models/Attendance");
const Leave = require("./models/Leave");

const seedDatabase = async () => {
    try {
        console.log("Connecting to Database...");
        await connectDB();

        console.log("Clearing old data...");
        await Employee.deleteMany({});
        await User.deleteMany({});
        await WorkingSchedule.deleteMany({});
        await TimeOffType.deleteMany({});
        await TimeOffAllocation.deleteMany({});
        await Contract.deleteMany({});
        await SalaryStructure.deleteMany({});
        await SalaryRule.deleteMany({});
        await Attendance.deleteMany({});
        await Leave.deleteMany({});

        console.log("Creating Working Schedules...");
        const schedules = await WorkingSchedule.insertMany([
            {
                name: "Standard 40h/week",
                type: "STANDARD",
                dayPatterns: [
                    { day: "Monday", startTime: "09:00", endTime: "18:00", breakDuration: 60 },
                    { day: "Tuesday", startTime: "09:00", endTime: "18:00", breakDuration: 60 },
                    { day: "Wednesday", startTime: "09:00", endTime: "18:00", breakDuration: 60 },
                    { day: "Thursday", startTime: "09:00", endTime: "18:00", breakDuration: 60 },
                    { day: "Friday", startTime: "09:00", endTime: "18:00", breakDuration: 60 }
                ]
            }
        ]);

        console.log("Creating Time Off Types...");
        const timeOffTypes = await TimeOffType.insertMany([
            { name: "Paid Leave", code: "PAID", unit: "DAYS", requiresAllocation: true, requiresApproval: true },
            { name: "Sick Leave", code: "SICK", unit: "DAYS", requiresAllocation: true, requiresApproval: true },
            { name: "Unpaid Leave", code: "UNPAID", unit: "DAYS", requiresAllocation: false, requiresApproval: true }
        ]);

        console.log("Creating Salary Rules...");
        const rules = await SalaryRule.insertMany([
            { name: "Basic Salary", code: "BASIC", sequence: 10, category: "BASIC", type: "EARNING", calculationType: "FIXED", amount: 0, active: true },
            { name: "House Rent Allowance", code: "HRA", sequence: 20, category: "ALLOWANCE", type: "EARNING", calculationType: "PERCENTAGE", percentage: 40, percentageOf: "BASIC", active: true },
            { name: "Transport Allowance", code: "TA", sequence: 30, category: "ALLOWANCE", type: "EARNING", calculationType: "FIXED", amount: 2000, active: true },
            { name: "Gross Salary", code: "GROSS", sequence: 40, category: "GROSS", type: "EARNING", calculationType: "FORMULA", formula: "BASIC + HRA + TA", active: true },
            { name: "Provident Fund", code: "PF", sequence: 50, category: "DEDUCTION", type: "DEDUCTION", calculationType: "PERCENTAGE", percentage: 12, percentageOf: "BASIC", active: true },
            { name: "Professional Tax", code: "PT", sequence: 60, category: "DEDUCTION", type: "DEDUCTION", calculationType: "FIXED", amount: 200, active: true },
            { name: "Net Salary", code: "NET", sequence: 70, category: "NET", type: "EARNING", calculationType: "FORMULA", formula: "GROSS - PF - PT", active: true }
        ]);

        console.log("Creating Salary Structures...");
        const structure = await SalaryStructure.create({
            name: "Standard Salary Structure",
            code: "STD_STRUCT",
            rules: rules.map(r => r._id)
        });

        console.log("Creating Employees...");
        const emp1 = await Employee.create({
            employeeId: "EMP001",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "1234567890",
            department: "Engineering",
            jobTitle: "Senior Developer",
            jobPosition: "Developer",
            workingSchedule: schedules[0]._id,
            joiningDate: new Date("2023-01-15"),
            bankAccount: "ACC123456789"
        });

        const emp2 = await Employee.create({
            employeeId: "EMP002",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            phone: "0987654321",
            department: "HR",
            jobTitle: "HR Manager",
            jobPosition: "Manager",
            workingSchedule: schedules[0]._id,
            joiningDate: new Date("2022-05-10"),
            bankAccount: "ACC987654321"
        });

        console.log("Creating Users...");
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash("password123", salt);

        await User.insertMany([
            { name: "John Doe", email: "john@example.com", password: passwordHash, role: "EMPLOYEE", employee: emp1._id },
            { name: "Jane Smith", email: "jane@example.com", password: passwordHash, role: "HR_PAYROLL_MANAGER", employee: emp2._id },
            { name: "Admin", email: "admin@example.com", password: passwordHash, role: "ADMIN" }
        ]);

        console.log("Creating Contracts...");
        await Contract.insertMany([
            {
                employee: emp1._id,
                contractType: "FULL_TIME",
                department: "Engineering",
                jobPosition: "Developer",
                startDate: new Date("2023-01-15"),
                salary: 80000,
                salaryStructure: structure._id,
                workingSchedule: schedules[0]._id,
                status: "ACTIVE"
            },
            {
                employee: emp2._id,
                contractType: "FULL_TIME",
                department: "HR",
                jobPosition: "Manager",
                startDate: new Date("2022-05-10"),
                salary: 60000,
                salaryStructure: structure._id,
                workingSchedule: schedules[0]._id,
                status: "ACTIVE"
            }
        ]);

        console.log("Creating Time Off Allocations...");
        await TimeOffAllocation.insertMany([
            { employee: emp1._id, timeOffType: timeOffTypes[0]._id, numberOfDays: 20, dateFrom: new Date("2024-01-01"), dateTo: new Date("2024-12-31"), status: "APPROVED", taken: 0, remaining: 20 },
            { employee: emp1._id, timeOffType: timeOffTypes[1]._id, numberOfDays: 10, dateFrom: new Date("2024-01-01"), dateTo: new Date("2024-12-31"), status: "APPROVED", taken: 0, remaining: 10 },
            { employee: emp2._id, timeOffType: timeOffTypes[0]._id, numberOfDays: 20, dateFrom: new Date("2024-01-01"), dateTo: new Date("2024-12-31"), status: "APPROVED", taken: 0, remaining: 20 }
        ]);

        console.log("Seed complete! You can login with email: admin@example.com and password: password123");
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
};

seedDatabase();
