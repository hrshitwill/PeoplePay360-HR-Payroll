const Contract = require("../models/Contract");

const createContract = async (req, res) => {
    try {
        const contract = await Contract.create(req.body);

        res.status(201).json({
            success: true,
            data: contract
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getContracts = async (req, res) => {
    try {
        const contracts = await Contract.find()
            .populate("employee")
            .populate("salaryStructure")
            .sort({ startDate: -1 });

        res.json({
            success: true,
            data: contracts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getContractById = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id)
            .populate("employee")
            .populate("salaryStructure");

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        res.json({
            success: true,
            data: contract
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getEmployeeContracts = async (req, res) => {
    try {
        const contracts = await Contract.find({
            employee: req.params.employeeId
        })
            .populate("salaryStructure")
            .sort({ startDate: -1 });

        res.json({
            success: true,
            data: contracts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createContract,
    getContracts,
    getContractById,
    getEmployeeContracts
};