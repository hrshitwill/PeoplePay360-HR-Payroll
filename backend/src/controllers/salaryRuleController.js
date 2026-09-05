const SalaryRule = require("../models/SalaryRule");

const getAllRules = async (req, res) => {
    try {
        const rules = await SalaryRule.find().sort({ sequence: 1 });
        res.json({ success: true, count: rules.length, data: rules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getRuleById = async (req, res) => {
    try {
        const rule = await SalaryRule.findById(req.params.id);
        if (!rule) return res.status(404).json({ success: false, message: "Rule not found" });
        res.json({ success: true, data: rule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createRule = async (req, res) => {
    try {
        const rule = await SalaryRule.create(req.body);
        res.status(201).json({ success: true, data: rule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateRule = async (req, res) => {
    try {
        const rule = await SalaryRule.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!rule) return res.status(404).json({ success: false, message: "Rule not found" });
        res.json({ success: true, data: rule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteRule = async (req, res) => {
    try {
        const rule = await SalaryRule.findByIdAndDelete(req.params.id);
        if (!rule) return res.status(404).json({ success: false, message: "Rule not found" });
        res.json({ success: true, message: "Rule deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllRules,
    getRuleById,
    createRule,
    updateRule,
    deleteRule
};
