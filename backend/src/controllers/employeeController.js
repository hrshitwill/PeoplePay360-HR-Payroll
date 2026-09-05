const Employee = require("../models/Employee");
const Contract = require("../models/Contract");
const Attendance = require("../models/Attendance");
const TimeOffRequest = require("../models/TimeOffRequest");
const TimeOffAllocation = require("../models/TimeOffAllocation");
const Payslip = require("../models/Payslip");

// Get all employees with optional filters
const getAllEmployees = async (req, res) => {
    try {
        const { department, status, employmentType, search } = req.query;
        const query = {};

        if (department) query.department = department;
        if (status) query.status = status;
        if (employmentType) query.employmentType = employmentType;

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { employeeId: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { jobTitle: { $regex: search, $options: "i" } }
            ];
        }

        const employees = await Employee.find(query)
            .populate("manager", "firstName lastName employeeId")
            .populate("workingSchedule", "name totalWeeklyHours type")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get employee by ID with smart button counts and active contract
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate("manager", "firstName lastName employeeId")
            .populate("workingSchedule");

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        // Fetch smart button statistics
        const [contractsCount, activeContract, attendanceCount, timeOffCount, allocationsCount, payslipsCount] = await Promise.all([
            Contract.countDocuments({ employee: employee._id }),
            Contract.findOne({ employee: employee._id, status: "ACTIVE" }).populate("salaryStructure workingSchedule"),
            Attendance.countDocuments({ employee: employee._id }),
            TimeOffRequest.countDocuments({ employee: employee._id }),
            TimeOffAllocation.countDocuments({ employee: employee._id }),
            Payslip.countDocuments({ employee: employee._id })
        ]);

        res.json({
            success: true,
            data: employee,
            smartButtons: {
                contractsCount,
                activeContract,
                attendanceCount,
                timeOffCount,
                allocationsCount,
                payslipsCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create employee
const createEmployee = async (req, res) => {
    try {
        const { employeeId, email } = req.body;

        const existing = await Employee.findOne({ $or: [{ employeeId }, { email }] });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Employee with this Employee ID or Email already exists"
            });
        }

        const employee = await Employee.create(req.body);
        res.status(201).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update employee
const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        res.json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        res.json({ success: true, message: "Employee removed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};