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

        // Link with matching employee if exists
        const employee = await Employee.findOne({ email: email.toLowerCase() });

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: role || "EMPLOYEE",
            linkedEmployee: employee ? employee._id : null
        });

        const token = generateToken(user);

        res.status(201).json({
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

// Demo quick-login by role (for instant hackathon evaluation without typing passwords)
const demoLogin = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ["ADMIN", "HR_MANAGER", "HR_PAYROLL_USER", "HR_PAYROLL_MANAGER", "EMPLOYEE"];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role specified" });
        }

        let user = await User.findOne({ role }).populate("linkedEmployee");

        // If not found in DB yet, create or find matching demo user
        if (!user) {
            let linkedEmp = null;
            if (role === "EMPLOYEE") {
                linkedEmp = await Employee.findOne({ status: "ACTIVE" });
            }

            const roleNames = {
                ADMIN: "Admin User",
                HR_MANAGER: "Sarah Jenkins (HR Manager)",
                HR_PAYROLL_USER: "David Kim (Payroll User)",
                HR_PAYROLL_MANAGER: "Elena Rostova (Payroll Director)",
                EMPLOYEE: "Alex Morgan (Employee)"
            };

            const roleEmails = {
                ADMIN: "admin@peoplepay360.com",
                HR_MANAGER: "sarah.jenkins@peoplepay360.com",
                HR_PAYROLL_USER: "david.kim@peoplepay360.com",
                HR_PAYROLL_MANAGER: "elena.rostova@peoplepay360.com",
                EMPLOYEE: "alex.morgan@peoplepay360.com"
            };

            user = await User.create({
                name: roleNames[role] || `${role} User`,
                email: roleEmails[role] || `${role.toLowerCase()}@peoplepay360.com`,
                password: "password123",
                role,
                linkedEmployee: linkedEmp ? linkedEmp._id : null
            });
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
