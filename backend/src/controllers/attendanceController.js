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

        // Calculate overtime (anything over 8 hours)
        const overtimeHours = Math.max(workingHours - 8, 0);

        attendance.checkOut = checkOutTime;
        attendance.workingHours = workingHours;
        attendance.overtimeHours = Math.round(overtimeHours * 100) / 100;

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
        const filter = {};
        if (req.query.employee) filter.employee = req.query.employee;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.dateFrom || req.query.dateTo) {
            filter.date = {};
            if (req.query.dateFrom) filter.date.$gte = new Date(req.query.dateFrom);
            if (req.query.dateTo) filter.date.$lte = new Date(req.query.dateTo);
        }

        const attendances = await Attendance.find(filter)
            .populate("employee")
            .populate("correctedBy")
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


// Create attendance record manually
const createAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.create(req.body);

        res.status(201).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// Update attendance (manual correction)
const updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        // Mark as manual correction
        const updateData = {
            ...req.body,
            isManualCorrection: true
        };

        // If user info available, track who corrected it
        if (req.user) {
            updateData.correctedBy = req.user._id;
        }

        // Recalculate working hours if checkIn and checkOut are provided
        if (updateData.checkIn && updateData.checkOut) {
            const checkInTime = new Date(updateData.checkIn);
            const checkOutTime = new Date(updateData.checkOut);
            const milliseconds = checkOutTime.getTime() - checkInTime.getTime();
            updateData.workingHours = Math.round((milliseconds / (1000 * 60 * 60)) * 100) / 100;
            updateData.overtimeHours = Math.max(updateData.workingHours - 8, 0);
        }

        Object.assign(attendance, updateData);
        await attendance.save();

        res.json({
            success: true,
            data: attendance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const getAttendanceById = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id)
            .populate("employee")
            .populate("correctedBy");

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        res.json({
            success: true,
            data: attendance
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
    getEmployeeAttendance,
    createAttendance,
    updateAttendance,
    getAttendanceById
};