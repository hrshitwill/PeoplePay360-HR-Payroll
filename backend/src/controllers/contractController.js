const Contract = require("../models/Contract");
const { validateConcurrentContracts } = require("../services/contractService");

// Get all contracts with optional filters
const getAllContracts = async (req, res) => {
    try {
        const { employeeId, status, department } = req.query;
        const query = {};

        if (employeeId) query.employee = employeeId;
        if (status) query.status = status;
        if (department) query.department = department;

        const contracts = await Contract.find(query)
            .populate("employee", "firstName lastName employeeId department jobTitle email avatar")
            .populate("salaryStructure", "name code")
            .populate("workingSchedule", "name totalWeeklyHours type")
            .sort({ startDate: -1 });

        res.json({
            success: true,
            count: contracts.length,
            data: contracts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single contract
const getContractById = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id)
            .populate("employee")
            .populate("salaryStructure")
            .populate("workingSchedule");

        if (!contract) {
            return res.status(404).json({ success: false, message: "Contract not found" });
        }

        res.json({ success: true, data: contract });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create contract with concurrency validation
const createContract = async (req, res) => {
    try {
        const { employee, startDate, endDate, status } = req.body;

        if (status === "ACTIVE" || !status) {
            const validation = await validateConcurrentContracts(employee, startDate, endDate);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message
                });
            }
        }

        const contract = await Contract.create(req.body);
        const populated = await Contract.findById(contract._id)
            .populate("employee", "firstName lastName employeeId")
            .populate("salaryStructure", "name code")
            .populate("workingSchedule", "name");

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update contract
const updateContract = async (req, res) => {
    try {
        const { employee, startDate, endDate, status } = req.body;

        if (status === "ACTIVE") {
            const validation = await validateConcurrentContracts(employee, startDate, endDate, req.params.id);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message
                });
            }
        }

        const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate("employee", "firstName lastName employeeId")
            .populate("salaryStructure", "name code")
            .populate("workingSchedule", "name");

        if (!contract) {
            return res.status(404).json({ success: false, message: "Contract not found" });
        }

        res.json({ success: true, data: contract });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete contract
const deleteContract = async (req, res) => {
    try {
        const contract = await Contract.findByIdAndDelete(req.params.id);
        if (!contract) {
            return res.status(404).json({ success: false, message: "Contract not found" });
        }
        res.json({ success: true, message: "Contract deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllContracts,
    getContractById,
    createContract,
    updateContract,
    deleteContract
};