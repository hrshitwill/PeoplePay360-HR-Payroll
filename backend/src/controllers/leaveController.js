const Leave = require("../models/Leave");

const createLeave = async (req, res) => {
    try {
        const leave = await Leave.create(req.body);

        res.status(201).json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate("employee")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: leaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getEmployeeLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({
            employee: req.params.employeeId
        }).sort({ startDate: -1 });

        const approvedDays = leaves
            .filter(leave => leave.status === "APPROVED")
            .reduce((total, leave) => total + leave.days, 0);

        const allocation =
            leaves.length > 0 ? leaves[0].allocation : 20;

        const balance = Math.max(
            allocation - approvedDays,
            0
        );

        res.json({
            success: true,
            data: leaves,
            summary: {
                allocation,
                approvedDays,
                balance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const approveLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status: "APPROVED" },
            {
                new: true,
                runValidators: true
            }
        );

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        res.json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const rejectLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status: "REJECTED" },
            {
                new: true,
                runValidators: true
            }
        );

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        res.json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createLeave,
    getLeaves,
    getEmployeeLeaves,
    approveLeave,
    rejectLeave
};