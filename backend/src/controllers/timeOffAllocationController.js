const TimeOffAllocation = require("../models/TimeOffAllocation");

const createAllocation = async (req, res) => {
    try {
        const allocation = await TimeOffAllocation.create(req.body);

        res.status(201).json({
            success: true,
            data: allocation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAllocations = async (req, res) => {
    try {
        const filter = {};
        if (req.query.employee) {
            filter.employee = req.query.employee;
        }

        const allocations = await TimeOffAllocation.find(filter)
            .populate("employee")
            .populate("timeOffType")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: allocations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllocationById = async (req, res) => {
    try {
        const allocation = await TimeOffAllocation.findById(req.params.id)
            .populate("employee")
            .populate("timeOffType");

        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: "Allocation not found"
            });
        }

        res.json({
            success: true,
            data: allocation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getEmployeeAllocations = async (req, res) => {
    try {
        const allocations = await TimeOffAllocation.find({
            employee: req.params.employeeId,
            status: "APPROVED"
        })
            .populate("timeOffType")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: allocations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const approveAllocation = async (req, res) => {
    try {
        const allocation = await TimeOffAllocation.findById(req.params.id);

        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: "Allocation not found"
            });
        }

        allocation.status = "APPROVED";
        await allocation.save();

        res.json({
            success: true,
            data: allocation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const refuseAllocation = async (req, res) => {
    try {
        const allocation = await TimeOffAllocation.findById(req.params.id);

        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: "Allocation not found"
            });
        }

        allocation.status = "REFUSED";
        await allocation.save();

        res.json({
            success: true,
            data: allocation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateAllocation = async (req, res) => {
    try {
        const allocation = await TimeOffAllocation.findById(req.params.id);

        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: "Allocation not found"
            });
        }

        Object.assign(allocation, req.body);
        await allocation.save();

        res.json({
            success: true,
            data: allocation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createAllocation,
    getAllocations,
    getAllocationById,
    getEmployeeAllocations,
    approveAllocation,
    refuseAllocation,
    updateAllocation
};
