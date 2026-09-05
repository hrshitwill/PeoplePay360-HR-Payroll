const SalaryRule = require("../models/SalaryRule");

const createSalaryRule = async (req, res) => {
    try {
        const rule = await SalaryRule.create(req.body);

        res.status(201).json({
            success: true,
            data: rule
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getSalaryRules = async (req, res) => {
    try {
        const rules = await SalaryRule.find()
            .sort({ sequence: 1 });

        res.json({
            success: true,
            data: rules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getSalaryRuleById = async (req, res) => {
    try {
        const rule = await SalaryRule.findById(req.params.id);

        if (!rule) {
            return res.status(404).json({
                success: false,
                message: "Salary rule not found"
            });
        }

        res.json({
            success: true,
            data: rule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateSalaryRule = async (req, res) => {
    try {
        const rule = await SalaryRule.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!rule) {
            return res.status(404).json({
                success: false,
                message: "Salary rule not found"
            });
        }

        res.json({
            success: true,
            data: rule
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createSalaryRule,
    getSalaryRules,
    getSalaryRuleById,
    updateSalaryRule
};