const TimeOffType = require("../models/TimeOffType");
const TimeOffAllocation = require("../models/TimeOffAllocation");
const TimeOffRequest = require("../models/TimeOffRequest");

// ==================== TIME OFF TYPES ====================

const getAllTimeOffTypes = async (req, res) => {
    try {
        const types = await TimeOffType.find().sort({ name: 1 });
        res.json({ success: true, count: types.length, data: types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createTimeOffType = async (req, res) => {
    try {
        const type = await TimeOffType.create(req.body);
        res.status(201).json({ success: true, data: type });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTimeOffType = async (req, res) => {
    try {
        const type = await TimeOffType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!type) return res.status(404).json({ success: false, message: "Type not found" });
        res.json({ success: true, data: type });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTimeOffType = async (req, res) => {
    try {
        const type = await TimeOffType.findByIdAndDelete(req.params.id);
        if (!type) return res.status(404).json({ success: false, message: "Type not found" });
        res.json({ success: true, message: "Time off type removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== TIME OFF ALLOCATIONS ====================

const getAllAllocations = async (req, res) => {
    try {
        const { employeeId, status } = req.query;
        const query = {};
        if (employeeId && employeeId !== "undefined" && employeeId !== "null") query.employee = employeeId;
        if (status && status !== "undefined" && status !== "null") query.status = status;

        const allocations = await TimeOffAllocation.find(query)
            .populate("employee", "firstName lastName employeeId department email")
            .populate("timeOffType", "name code unit color")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: allocations.length, data: allocations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createAllocation = async (req, res) => {
    try {
        const allocation = new TimeOffAllocation(req.body);
        await allocation.save();
        const populated = await TimeOffAllocation.findById(allocation._id)
            .populate("employee", "firstName lastName employeeId")
            .populate("timeOffType", "name code unit color");
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const approveAllocation = async (req, res) => {
    try {
        const allocation = await TimeOffAllocation.findById(req.params.id);
        if (!allocation) return res.status(404).json({ success: false, message: "Allocation not found" });

        allocation.status = "APPROVED";
        allocation.approvedBy = req.body.approvedBy || "HR Manager";
        await allocation.save();

        res.json({ success: true, message: "Allocation approved", data: allocation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const refuseAllocation = async (req, res) => {
    try {
        const allocation = await TimeOffAllocation.findById(req.params.id);
        if (!allocation) return res.status(404).json({ success: false, message: "Allocation not found" });

        allocation.status = "REFUSED";
        await allocation.save();

        res.json({ success: true, message: "Allocation refused", data: allocation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== TIME OFF REQUESTS ====================

const getAllRequests = async (req, res) => {
    try {
        const { employeeId, status } = req.query;
        const query = {};
        if (employeeId && employeeId !== "undefined" && employeeId !== "null") query.employee = employeeId;
        if (status && status !== "undefined" && status !== "null") query.status = status;

        const requests = await TimeOffRequest.find(query)
            .populate("employee", "firstName lastName employeeId department email avatar")
            .populate("timeOffType", "name code unit color requiresAllocation")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createRequest = async (req, res) => {
    try {
        const { employee, timeOffType, duration } = req.body;

        // Check if allocation is required and verify balance
        const typeDoc = await TimeOffType.findById(timeOffType);
        if (typeDoc && typeDoc.requiresAllocation) {
            const allocation = await TimeOffAllocation.findOne({
                employee,
                timeOffType,
                status: "APPROVED"
            });

            if (!allocation || allocation.remainingUnits < Number(duration)) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient leave balance. Available: ${allocation ? allocation.remainingUnits : 0} ${typeDoc.unit.toLowerCase()}, requested: ${duration}`
                });
            }
        }

        const request = await TimeOffRequest.create(req.body);
        const populated = await TimeOffRequest.findById(request._id)
            .populate("employee", "firstName lastName employeeId")
            .populate("timeOffType", "name code unit color");

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Approve Request - deducts balance from matching allocation
const approveRequest = async (req, res) => {
    try {
        const request = await TimeOffRequest.findById(req.params.id).populate("timeOffType");
        if (!request) return res.status(404).json({ success: false, message: "Leave request not found" });

        if (request.status === "APPROVED") {
            return res.status(400).json({ success: false, message: "Request is already approved" });
        }

        // Deduct from allocation if required
        if (request.timeOffType && request.timeOffType.requiresAllocation) {
            const allocation = await TimeOffAllocation.findOne({
                employee: request.employee,
                timeOffType: request.timeOffType._id,
                status: "APPROVED"
            });

            if (allocation) {
                allocation.takenUnits += Number(request.duration);
                allocation.remainingUnits = Math.max(0, allocation.allocatedUnits - allocation.takenUnits);
                await allocation.save();
            }
        }

        request.status = "APPROVED";
        request.approvedBy = req.body.approvedBy || "HR Manager";
        request.approvalDate = new Date();
        await request.save();

        res.json({
            success: true,
            message: "Leave request approved and balance successfully updated",
            data: request
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Refuse Request
const refuseRequest = async (req, res) => {
    try {
        const request = await TimeOffRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: "Leave request not found" });

        request.status = "REFUSED";
        request.rejectionReason = req.body.rejectionReason || "Refused by manager";
        await request.save();

        res.json({ success: true, message: "Leave request refused", data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Employee balances overview
const getEmployeeBalances = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const allocations = await TimeOffAllocation.find({
            employee: employeeId,
            status: "APPROVED"
        }).populate("timeOffType");

        res.json({ success: true, data: allocations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllTimeOffTypes,
    createTimeOffType,
    updateTimeOffType,
    deleteTimeOffType,
    getAllAllocations,
    createAllocation,
    approveAllocation,
    refuseAllocation,
    getAllRequests,
    createRequest,
    approveRequest,
    refuseRequest,
    getEmployeeBalances
};
