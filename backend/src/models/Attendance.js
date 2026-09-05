const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        checkIn: {
            type: Date,
            default: null
        },

        checkOut: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: ["PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE", "LATE"],
            default: "PRESENT"
        },

        workingHours: {
            type: Number,
            default: 0
        },

        overtimeHours: {
            type: Number,
            default: 0
        },

        isManualCorrection: {
            type: Boolean,
            default: false
        },

        correctedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        remarks: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// One attendance record per employee per day
attendanceSchema.index(
    { employee: 1, date: 1 },
    { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);