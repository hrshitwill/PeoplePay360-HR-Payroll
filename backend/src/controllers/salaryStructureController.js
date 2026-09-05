const SalaryStructure = require("../models/SalaryStructure");

const createSalaryStructure = async (req, res) => {
    try {
        const structure = await SalaryStructure.create(req.body);

        res.status(201).json({
            success: true,
            data: structure
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getSalaryStructures = async (req, res) => {
    try {
        const structures = await SalaryStructure.find()
            .populate("rules")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: structures
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getSalaryStructureById = async (req, res) => {
    try {
        const structure = await SalaryStructure.findById(req.params.id)
            .populate("rules");

        if (!structure) {
            return res.status(404).json({
                success: false,
                message: "Salary structure not found"
            });
        }

        res.json({
            success: true,
            data: structure
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateSalaryStructure = async (req, res) => {
    try {
        const structure = await SalaryStructure.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate("rules");

        if (!structure) {
            return res.status(404).json({
                success: false,
                message: "Salary structure not found"
            });
        }

        res.json({
            success: true,
            data: structure
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createSalaryStructure,
    getSalaryStructures,
    getSalaryStructureById,
    updateSalaryStructure
};
