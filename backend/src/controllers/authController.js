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

            await Contract.create({
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
