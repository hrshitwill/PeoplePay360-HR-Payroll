const mongoose = require("mongoose");

const timeOffTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },

        unit: {
            type: String,
            enum: ["DAYS", "HOURS"],
            default: "DAYS"
        },

        requiresAllocation: {
            type: Boolean,
            default: true
        },

        requiresApproval: {
            type: Boolean,
            default: true
        },

        color: {
            type: String,
            default: "#6366f1"
        },

        affectsPayroll: {
            type: Boolean,
            default: false
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

module.exports = mongoose.model("TimeOffType", timeOffTypeSchema);
