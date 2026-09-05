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
            uppercase: true,
            trim: true
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
        isPaid: {
            type: Boolean,
            default: true
        },
        color: {
            type: String,
            default: "#3B82F6"
        },
        approvalWorkflow: {
            type: String,
            enum: ["MANAGER_APPROVAL", "NO_APPROVAL"],
            default: "MANAGER_APPROVAL"
        },
        description: {
            type: String,
            default: ""
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
