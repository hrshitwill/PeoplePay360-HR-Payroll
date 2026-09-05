const Contract = require("../models/Contract");

const createContract = async (req, res) => {
    try {
        // Check for concurrent active contracts
        if (req.body.status === "ACTIVE") {
            const existing = await Contract.findOne({
                employee: req.body.employee,
                status: "ACTIVE"
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Employee already has an active contract. Please expire or terminate it first."
                });
            }
        }

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
        const filter = {};
        if (req.query.employee) filter.employee = req.query.employee;
        if (req.query.status) filter.status = req.query.status;

        const contracts = await Contract.find(filter)
            .populate("employee")
            .populate("salaryStructure")
            .populate("workingSchedule")
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
            .populate("salaryStructure")
            .populate("workingSchedule");

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
            .populate("workingSchedule")
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

const updateContract = async (req, res) => {
    try {
        // If setting to ACTIVE, check no other active contract
        if (req.body.status === "ACTIVE") {
            const contract = await Contract.findById(req.params.id);
            if (contract) {
                const existing = await Contract.findOne({
                    employee: contract.employee,
                    status: "ACTIVE",
                    _id: { $ne: req.params.id }
                });

                if (existing) {
                    return res.status(400).json({
                        success: false,
                        message: "Employee already has another active contract."
                    });
                }
            }
        }

        const contract = await Contract.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate("employee")
            .populate("salaryStructure")
            .populate("workingSchedule");

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
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteContract = async (req, res) => {
    try {
        const contract = await Contract.findByIdAndDelete(req.params.id);

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: "Contract not found"
            });
        }

        res.json({
            success: true,
            message: "Contract deleted successfully"
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
    getEmployeeContracts,
    updateContract,
    deleteContract
};