const WorkingSchedule = require("../models/WorkingSchedule");

const createSchedule = async (req, res) => {
    try {
        const schedule = await WorkingSchedule.create(req.body);

        res.status(201).json({
            success: true,
            data: schedule
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getSchedules = async (req, res) => {
    try {
        const schedules = await WorkingSchedule.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: schedules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getScheduleById = async (req, res) => {
    try {
        const schedule = await WorkingSchedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Working schedule not found"
            });
        }

        res.json({
            success: true,
            data: schedule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateSchedule = async (req, res) => {
    try {
        const schedule = await WorkingSchedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Working schedule not found"
            });
        }

        Object.assign(schedule, req.body);
        await schedule.save(); // triggers pre-save hook for totalWeeklyHours

        res.json({
            success: true,
            data: schedule
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteSchedule = async (req, res) => {
    try {
        const schedule = await WorkingSchedule.findByIdAndDelete(req.params.id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Working schedule not found"
            });
        }

        res.json({
            success: true,
            message: "Working schedule deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createSchedule,
    getSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
};
