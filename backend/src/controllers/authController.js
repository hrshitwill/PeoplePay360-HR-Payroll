const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || "EMPLOYEE"
        });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            success: true,
            data: { user, token }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate("employee");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.active) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            data: { user, token }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .populate("employee")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { role, active, employee } = req.body;
        const update = {};
        if (role) update.role = role;
        if (active !== undefined) update.active = active;
        if (employee !== undefined) update.employee = employee;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true }
        ).populate("employee");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    getUsers,
    updateUser
};
