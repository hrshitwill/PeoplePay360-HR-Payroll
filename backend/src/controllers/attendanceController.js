const Attendance = require("../models/Attendance");

// Get all attendance entries with optional filters
const getAllAttendance = async (req, res) => {
    try {
        const { employeeId, startDate, endDate, status } = req.query;
        const query = {};

        if (employeeId && employeeId !== "undefined" && employeeId !== "null") query.employee = employeeId;
        if (status && status !== "undefined" && status !== "null") query.status = status;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const attendance = await Attendance.find(query)
            .populate("employee", "firstName lastName employeeId department avatar")
            .sort({ date: -1, createdAt: -1 });

        res.json({ success: true, count: attendance.length, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Clock In
const clockIn = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: today }
        });

        if (attendance && attendance.checkIn) {
            return res.status(400).json({
                success: false,
                message: "Employee is already clocked in for today"
            });
        }

        if (!attendance) {
            attendance = new Attendance({
                employee: employeeId,
                date: new Date(),
                checkIn: new Date(),
                status: "MISSING_CHECKOUT"
            });
        } else {
            attendance.checkIn = new Date();
            attendance.status = "MISSING_CHECKOUT";
        }

        await attendance.save();
        const populated = await Attendance.findById(attendance._id).populate("employee", "firstName lastName employeeId");
        res.status(200).json({ success: true, message: "Clocked in successfully", data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Clock Out
const clockOut = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: today }
        });

        if (!attendance || !attendance.checkIn) {
            return res.status(400).json({
                success: false,
                message: "No active check-in found for today. Please clock in first."
            });
        }

        if (attendance.checkOut) {
            return res.status(400).json({
                success: false,
                message: "Employee has already clocked out for today."
            });
        }

        attendance.checkOut = new Date();
        await attendance.save(); // pre-save calculates workedHours and status

        const populated = await Attendance.findById(attendance._id).populate("employee", "firstName lastName employeeId");
        res.status(200).json({ success: true, message: "Clocked out successfully", data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Manual Correction with Audit Tracking
const manualCorrection = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut, workedHours, status, reason, correctedBy } = req.body;

        const attendance = await Attendance.findById(id);
        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance entry not found" });
        }

        // Preserve original record for audit integrity
        if (!attendance.isManuallyCorrected) {
            attendance.originalRecord = {
                checkIn: attendance.checkIn,
                checkOut: attendance.checkOut,
                workedHours: attendance.workedHours
            };
        }

        attendance.isManuallyCorrected = true;
        attendance.correctionReason = reason || "Administrative correction";
        attendance.correctedBy = correctedBy || "HR Manager";

        if (checkIn) attendance.checkIn = new Date(checkIn);
        if (checkOut) attendance.checkOut = new Date(checkOut);
        if (workedHours !== undefined) attendance.workedHours = Number(workedHours);
        if (status) attendance.status = status;

        await attendance.save();

        const populated = await Attendance.findById(attendance._id).populate("employee", "firstName lastName employeeId");
        res.json({
            success: true,
            message: "Attendance entry corrected and audit trail updated",
            data: populated
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create raw attendance entry
const createAttendance = async (req, res) => {
    try {
        const attendance = new Attendance(req.body);
        await attendance.save();
        const populated = await Attendance.findById(attendance._id).populate("employee", "firstName lastName employeeId");
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Attendance stats overview
const getAttendanceStats = async (req, res) => {
    try {
        const total = await Attendance.countDocuments();
        const present = await Attendance.countDocuments({ status: "PRESENT" });
        const late = await Attendance.countDocuments({ status: "LATE" });
        const absent = await Attendance.countDocuments({ status: "ABSENT" });
        const overtime = await Attendance.countDocuments({ status: "OVERTIME" });
        const exceptions = await Attendance.countDocuments({
            $or: [{ status: "MISSING_CHECKOUT" }, { isManuallyCorrected: true }]
        });

        res.json({
            success: true,
            data: {
                total,
                present,
                late,
                absent,
                overtime,
                exceptions,
                healthPercentage: total > 0 ? Number(((present + overtime) / total * 100).toFixed(1)) : 100
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get today's attendance for a specific employee
const getTodayAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: today }
        }).populate("employee", "firstName lastName employeeId department");

        res.json({
            success: true,
            data: attendance || null
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get personal attendance logs for employee
const getEmployeeAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const records = await Attendance.find({ employee: employeeId })
            .populate("employee", "firstName lastName employeeId department")
            .sort({ date: -1, checkIn: -1 })
            .limit(100);

        res.json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllAttendance,
    clockIn,
    clockOut,
    manualCorrection,
    createAttendance,
    getAttendanceStats,
    getTodayAttendance,
    getEmployeeAttendance
};
