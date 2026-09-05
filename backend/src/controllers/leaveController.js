const Leave = require("../models/Leave");
const TimeOffAllocation = require("../models/TimeOffAllocation");

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
        const filter = {};
        if (req.query.employee) filter.employee = req.query.employee;
        if (req.query.status) filter.status = req.query.status;

        const leaves = await Leave.find(filter)
            .populate("employee")
            .populate("timeOffType")
            .populate("allocation")
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

const getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id)
            .populate("employee")
            .populate("timeOffType")
            .populate("allocation");

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
        })
            .populate("timeOffType")
            .populate("allocation")
            .sort({ startDate: -1 });

        const approvedDays = leaves
            .filter(leave => leave.status === "APPROVED")
            .reduce((total, leave) => total + leave.days, 0);

        // Get allocations for balance
        const allocations = await TimeOffAllocation.find({
            employee: req.params.employeeId,
            status: "APPROVED"
        }).populate("timeOffType");

        const totalAllocation = allocations.reduce(
            (sum, a) => sum + a.numberOfDays, 0
        );
        const totalRemaining = allocations.reduce(
            (sum, a) => sum + a.remaining, 0
        );

        res.json({
            success: true,
            data: leaves,
            summary: {
                totalAllocation,
                approvedDays,
                remaining: totalRemaining
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
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        if (leave.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be approved"
            });
        }

        leave.status = "APPROVED";
        await leave.save();

        // Deduct from allocation if linked
        if (leave.allocation) {
            const allocation = await TimeOffAllocation.findById(leave.allocation);
            if (allocation) {
                allocation.taken += leave.days;
                await allocation.save(); // triggers pre-save to recalculate remaining
            }
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
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        if (leave.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be rejected"
            });
        }

        leave.status = "REJECTED";
        await leave.save();

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
    getLeaveById,
    getEmployeeLeaves,
    approveLeave,
    rejectLeave
};