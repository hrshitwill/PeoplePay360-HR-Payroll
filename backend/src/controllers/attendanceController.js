const Attendance = require("../models/Attendance");

// Check In
const checkIn = async (req, res) => {
    try {
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
            });
        }

        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Check if attendance already exists today
        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: "Employee has already checked in today"
            });
        }

        const attendance = await Attendance.create({
            employee: employeeId,
            date: today,
            checkIn: today,
            status: "PRESENT",
            workingHours: 0
        });

        res.status(201).json({
            success: true,
            message: "Check-in successful",
            data: attendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Check Out
const checkOut = async (req, res) => {
    try {
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
            });
        }

        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Find today's attendance
        const attendance = await Attendance.findOne({
            employee: employeeId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Employee has not checked in today"
            });
        }

        if (!attendance.checkIn) {
            return res.status(400).json({
                success: false,
                message: "Check-in time is missing"
            });
        }

        if (attendance.checkOut) {
            return res.status(400).json({
                success: false,
                message: "Employee has already checked out today"
            });
        }

        const checkOutTime = new Date();

        // Calculate working hours
        const millisecondsWorked =
            checkOutTime.getTime() - attendance.checkIn.getTime();

        const workingHours =
            Math.round((millisecondsWorked / (1000 * 60 * 60)) * 100) / 100;

        attendance.checkOut = checkOutTime;
        attendance.workingHours = workingHours;

        await attendance.save();

        res.json({
            success: true,
            message: "Check-out successful",
            data: attendance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getAttendances = async (req, res) => {
    try {
        const attendances = await Attendance.find()
            .populate("employee")
            .sort({ date: -1 });

        res.json({
            success: true,
            data: attendances
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getEmployeeAttendance = async (req, res) => {
    try {
        const attendances = await Attendance.find({
            employee: req.params.employeeId
        })
            .populate("employee")
            .sort({ date: -1 });

        res.json({
            success: true,
            data: attendances
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    checkIn,
    checkOut,
    getAttendances,
    getEmployeeAttendance
};