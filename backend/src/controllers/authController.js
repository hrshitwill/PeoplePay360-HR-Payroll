const User = require("../models/User");
const Employee = require("../models/Employee");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET || "your_secret",
        { expiresIn: "7d" }
    );
};

// Register new user
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide name, email, and password" });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: "A user with this email already exists" });
        }

        const assignedRole = role || "EMPLOYEE";

        // Link with matching employee if exists, or auto-provision if registering as EMPLOYEE
        let employee = await Employee.findOne({ email: email.toLowerCase() });

        if (!employee && assignedRole === "EMPLOYEE") {
            const count = await Employee.countDocuments();
            const parts = name.trim().split(" ");
            const firstName = parts[0] || "Employee";
            const lastName = parts.slice(1).join(" ") || "User";
            const employeeId = `EMP-${String(count + 1).padStart(4, "0")}`;

            employee = await Employee.create({
                employeeId,
                firstName,
                lastName,
                email: email.toLowerCase(),
                department: "Engineering",
                jobTitle: "Software Engineer",
                status: "ACTIVE",
                employmentType: "FULL_TIME",
                joiningDate: new Date(),
                bankDetails: {
                    bankName: "Standard Chartered",
                    accountNumber: `4500${Math.floor(100000 + Math.random() * 900000)}`,
                    ifscRouting: "SCBLUS33",
                    accountHolderName: name
                }
            });

            // Create active employment contract for the employee
            const Contract = require("../models/Contract");
            const SalaryStructure = require("../models/SalaryStructure");
            const structure = await SalaryStructure.findOne({ active: true });

            const contract = await Contract.create({
                contractReference: `CNT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
                employee: employee._id,
                contractType: "FULL_TIME",
                jobPosition: employee.jobTitle,
                department: employee.department,
                startDate: new Date("2026-01-01"),
                salary: 6500,
                salaryStructure: structure ? structure._id : null,
                status: "ACTIVE",
                notes: "Initial employee onboarding agreement"
            });

            // Allocate standard leave quota
            const TimeOffType = require("../models/TimeOffType");
            const TimeOffAllocation = require("../models/TimeOffAllocation");
            const ptoType = await TimeOffType.findOne({ code: "PTO" }) || await TimeOffType.findOne();

            if (ptoType) {
                await TimeOffAllocation.create({
                    name: "2026 Annual Leave Quota",
                    employee: employee._id,
                    timeOffType: ptoType._id,
                    allocatedUnits: 20,
                    takenUnits: 0,
                    remainingUnits: 20,
                    validityStartDate: new Date("2026-01-01"),
                    validityEndDate: new Date("2026-12-31"),
                    status: "APPROVED"
                });
            }

            // Auto-provision initial individual payrun records so employee can download their payruns
            const Payrun = require("../models/Payrun");
            const Payslip = require("../models/Payslip");
            const { calculateSalary } = require("../services/salaryRuleEngine");

            let latestPayrun = await Payrun.findOne().sort({ periodEnd: -1 });
            if (!latestPayrun) {
                latestPayrun = await Payrun.create({
                    name: "August 2026 Regular Corporate Payrun",
                    payrunBatchNumber: "PAYRUN-2026-08",
                    periodStart: new Date("2026-08-01"),
                    periodEnd: new Date("2026-08-31"),
                    salaryStructure: structure ? structure._id : null,
                    status: "APPROVED",
                    paymentDate: new Date("2026-08-31"),
                    employees: [employee._id]
                });
            } else if (!latestPayrun.employees.includes(employee._id)) {
                latestPayrun.employees.push(employee._id);
                await latestPayrun.save();
            }

            if (structure && contract) {
                const populatedStructure = await SalaryStructure.findById(structure._id).populate({
                    path: "rules",
                    options: { sort: { sequence: 1 } }
                });
                const rules = populatedStructure?.rules || [];
                const computed = calculateSalary(rules, contract.salary);
                const psCount = await Payslip.countDocuments();

                await Payslip.create({
                    payslipNumber: `PS-2026-${String(psCount + 1).padStart(5, "0")}`,
                    employee: employee._id,
                    payrun: latestPayrun._id,
                    contract: contract._id,
                    salaryStructure: structure._id,
                    periodStart: latestPayrun.periodStart,
                    periodEnd: latestPayrun.periodEnd,
                    workedDays: 22,
                    totalWorkingDays: 22,
                    grossSalary: computed.grossSalary,
                    totalDeductions: computed.totalDeductions,
                    netSalary: computed.netSalary,
                    lines: computed.lines,
                    status: "PAID"
                });
            }
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: assignedRole,
            linkedEmployee: employee ? employee._id : null
        });

        const token = generateToken(user);
        const populatedUser = await User.findById(user._id).select("-password").populate("linkedEmployee");

        res.status(201).json({
            success: true,
            token,
            user: populatedUser
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please enter email and password" });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).populate("linkedEmployee");
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (user.status === "INACTIVE") {
            return res.status(403).json({
                success: false,
                message: "This account is inactive. Please register your own user ID to access the system."
            });
        }

        // If employee user lacks linkedEmployee record, link or provision it
        if (user.role === "EMPLOYEE" && !user.linkedEmployee) {
            let employee = await Employee.findOne({ email: user.email.toLowerCase() });
            if (!employee) {
                const count = await Employee.countDocuments();
                const parts = user.name.trim().split(" ");
                employee = await Employee.create({
                    employeeId: `EMP-${String(count + 1).padStart(4, "0")}`,
                    firstName: parts[0] || "Employee",
                    lastName: parts.slice(1).join(" ") || "User",
                    email: user.email.toLowerCase(),
                    department: "Engineering",
                    jobTitle: "Software Engineer",
                    status: "ACTIVE",
                    employmentType: "FULL_TIME",
                    joiningDate: new Date()
                });
            }
            user.linkedEmployee = employee._id;
            await user.save();
            await user.populate("linkedEmployee");
        }

        // Ensure employee user has payrun statements available for download
        if (user.role === "EMPLOYEE" && user.linkedEmployee) {
            const Payslip = require("../models/Payslip");
            const hasPayslips = await Payslip.countDocuments({ employee: user.linkedEmployee._id });
            if (hasPayslips === 0) {
                const Contract = require("../models/Contract");
                const Payrun = require("../models/Payrun");
                const SalaryStructure = require("../models/SalaryStructure");
                const { calculateSalary } = require("../services/salaryRuleEngine");

                const structure = await SalaryStructure.findOne({ active: true });
                let contract = await Contract.findOne({ employee: user.linkedEmployee._id, status: "ACTIVE" });
                if (!contract && structure) {
                    contract = await Contract.create({
                        contractReference: `CNT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
                        employee: user.linkedEmployee._id,
                        contractType: "FULL_TIME",
                        jobPosition: user.linkedEmployee.jobTitle || "Software Engineer",
                        department: user.linkedEmployee.department || "Engineering",
                        startDate: new Date("2026-01-01"),
                        salary: 6500,
                        salaryStructure: structure._id,
                        status: "ACTIVE",
                        notes: "Onboarding agreement"
                    });
                }

                let latestPayrun = await Payrun.findOne().sort({ periodEnd: -1 });
                if (!latestPayrun) {
                    latestPayrun = await Payrun.create({
                        name: "August 2026 Regular Corporate Payrun",
                        payrunBatchNumber: "PAYRUN-2026-08",
                        periodStart: new Date("2026-08-01"),
                        periodEnd: new Date("2026-08-31"),
                        salaryStructure: structure ? structure._id : null,
                        status: "APPROVED",
                        paymentDate: new Date("2026-08-31"),
                        employees: [user.linkedEmployee._id]
                    });
                } else if (!latestPayrun.employees.includes(user.linkedEmployee._id)) {
                    latestPayrun.employees.push(user.linkedEmployee._id);
                    await latestPayrun.save();
                }

                if (contract && structure) {
                    const populatedStructure = await SalaryStructure.findById(structure._id).populate({
                        path: "rules",
                        options: { sort: { sequence: 1 } }
                    });
                    const rules = populatedStructure?.rules || [];
                    const computed = calculateSalary(rules, contract.salary);
                    const psCount = await Payslip.countDocuments();

                    await Payslip.create({
                        payslipNumber: `PS-2026-${String(psCount + 1).padStart(5, "0")}`,
                        employee: user.linkedEmployee._id,
                        payrun: latestPayrun._id,
                        contract: contract._id,
                        salaryStructure: structure._id,
                        periodStart: latestPayrun.periodStart,
                        periodEnd: latestPayrun.periodEnd,
                        workedDays: 22,
                        totalWorkingDays: 22,
                        grossSalary: computed.grossSalary,
                        totalDeductions: computed.totalDeductions,
                        netSalary: computed.netSalary,
                        lines: computed.lines,
                        status: "PAID"
                    });
                }
            }
        }

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                linkedEmployee: user.linkedEmployee
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get current logged-in user profile
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password").populate("linkedEmployee");
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Demo login disabled - users must register and authenticate their own account
const demoLogin = async (req, res) => {
    return res.status(403).json({
        success: false,
        message: "Demo login is disabled. Please create and log in to your own account."
    });
};

// Get available roles overview
const getAvailableRoles = async (req, res) => {
    try {
        res.json({
            success: true,
            roles: [
                {
                    id: "ADMIN",
                    label: "Admin",
                    email: "admin@peoplepay360.com",
                    description: "Full platform access across all HR, Payroll, and Configuration modules",
                    password: "password123"
                },
                {
                    id: "HR_MANAGER",
                    label: "HR Manager",
                    email: "sarah.jenkins@peoplepay360.com",
                    description: "Full CRUD for Employees, Contracts, Schedules, Attendance, and Leaves. No Payroll access.",
                    password: "password123"
                },
                {
                    id: "HR_PAYROLL_USER",
                    label: "HR Payroll User",
                    email: "david.kim@peoplepay360.com",
                    description: "HR Manager access + Payruns and Payslips processing. Read-only on Salary Structures.",
                    password: "password123"
                },
                {
                    id: "HR_PAYROLL_MANAGER",
                    label: "HR Payroll Manager",
                    email: "elena.rostova@peoplepay360.com",
                    description: "Full control over HR, Payruns, Payslips, Salary Structures, and Rules.",
                    password: "password123"
                },
                {
                    id: "EMPLOYEE",
                    label: "Employee",
                    email: "alex.morgan@peoplepay360.com",
                    description: "Self-service only: view own profile, attendance, leave balance, submit leave requests.",
                    password: "password123"
                }
            ]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    register,
    login,
    getMe,
    demoLogin,
    getAvailableRoles
};
