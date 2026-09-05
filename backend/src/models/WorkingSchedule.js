const mongoose = require("mongoose");

const dayPatternSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        breakDuration: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { _id: false }
);

const workingScheduleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["STANDARD", "FLEXIBLE"],
            default: "STANDARD"
        },

        dayPatterns: [dayPatternSchema],

        totalWeeklyHours: {
            type: Number,
            default: 0
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Auto-calculate total weekly hours before saving
workingScheduleSchema.pre("save", function (next) {
    if (this.dayPatterns && this.dayPatterns.length > 0) {
        this.totalWeeklyHours = this.dayPatterns.reduce((total, pattern) => {
            const [startH, startM] = pattern.startTime.split(":").map(Number);
            const [endH, endM] = pattern.endTime.split(":").map(Number);

            const startMinutes = startH * 60 + (startM || 0);
            const endMinutes = endH * 60 + (endM || 0);
            const workMinutes = endMinutes - startMinutes - (pattern.breakDuration || 0);

            return total + Math.max(workMinutes / 60, 0);
        }, 0);

        this.totalWeeklyHours = Math.round(this.totalWeeklyHours * 100) / 100;
    }

    next();
});

module.exports = mongoose.model("WorkingSchedule", workingScheduleSchema);
