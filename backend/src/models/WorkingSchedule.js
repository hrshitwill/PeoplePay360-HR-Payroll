const mongoose = require("mongoose");

const scheduleLineSchema = new mongoose.Schema({
    dayOfWeek: {
        type: String,
        enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
        required: true
    },
    startTime: {
        type: String,
        default: "09:00"
    },
    endTime: {
        type: String,
        default: "17:00"
    },
    breakHours: {
        type: Number,
        default: 1
    },
    dailyHours: {
        type: Number,
        default: 7
    }
});

const workingScheduleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["STANDARD", "FLEXIBLE", "SHIFT", "PART_TIME"],
            default: "STANDARD"
        },
        description: {
            type: String,
            default: ""
        },
        totalWeeklyHours: {
            type: Number,
            default: 35
        },
        lines: [scheduleLineSchema],
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Pre-save hook to calculate totalWeeklyHours automatically from lines
workingScheduleSchema.pre("save", function () {
    if (this.lines && this.lines.length > 0) {
        let total = 0;
        this.lines.forEach((line) => {
            if (line.startTime && line.endTime) {
                const [startH, startM] = line.startTime.split(":").map(Number);
                const [endH, endM] = line.endTime.split(":").map(Number);
                const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
                const workedHours = Math.max(0, (diffMinutes / 60) - (line.breakHours || 0));
                line.dailyHours = Number(workedHours.toFixed(2));
                total += line.dailyHours;
            } else {
                total += line.dailyHours || 0;
            }
        });
        this.totalWeeklyHours = Number(total.toFixed(2));
    }
});

module.exports = mongoose.model("WorkingSchedule", workingScheduleSchema);
