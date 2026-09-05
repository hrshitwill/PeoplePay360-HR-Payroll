const WorkingSchedule = require("../models/WorkingSchedule");

const getAllSchedules = async (req, res) => {
    try {
        const schedules = await WorkingSchedule.find().sort({ createdAt: -1 });
        res.json({ success: true, count: schedules.length, data: schedules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getScheduleById = async (req, res) => {
    try {
        const schedule = await WorkingSchedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Working schedule not found" });
        }
        res.json({ success: true, data: schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createSchedule = async (req, res) => {
    try {
        const schedule = new WorkingSchedule(req.body);
        await schedule.save();
        res.status(201).json({ success: true, data: schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSchedule = async (req, res) => {
    try {
        const schedule = await WorkingSchedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Working schedule not found" });
        }

        Object.assign(schedule, req.body);
        await schedule.save(); // triggers pre-save hook for hours recalculation

        res.json({ success: true, data: schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteSchedule = async (req, res) => {
    try {
        const schedule = await WorkingSchedule.findByIdAndDelete(req.params.id);
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Working schedule not found" });
        }
        res.json({ success: true, message: "Schedule deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule
};
