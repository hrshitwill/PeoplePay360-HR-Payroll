const TimeOffType = require("../models/TimeOffType");

const createTimeOffType = async (req, res) => {
    try {
        const type = await TimeOffType.create(req.body);

        res.status(201).json({
            success: true,
            data: type
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getTimeOffTypes = async (req, res) => {
    try {
        const types = await TimeOffType.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getTimeOffTypeById = async (req, res) => {
    try {
        const type = await TimeOffType.findById(req.params.id);

        if (!type) {
            return res.status(404).json({
                success: false,
                message: "Time off type not found"
            });
        }

        res.json({
            success: true,
            data: type
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateTimeOffType = async (req, res) => {
    try {
        const type = await TimeOffType.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!type) {
            return res.status(404).json({
                success: false,
                message: "Time off type not found"
            });
        }

        res.json({
            success: true,
            data: type
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteTimeOffType = async (req, res) => {
    try {
        const type = await TimeOffType.findByIdAndDelete(req.params.id);

        if (!type) {
            return res.status(404).json({
                success: false,
                message: "Time off type not found"
            });
        }

        res.json({
            success: true,
            message: "Time off type deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createTimeOffType,
    getTimeOffTypes,
    getTimeOffTypeById,
    updateTimeOffType,
    deleteTimeOffType
};
