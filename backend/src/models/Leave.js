const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        timeOffType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TimeOffType",
            default: null
        },

        allocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TimeOffAllocation",
            default: null
        },

        leaveType: {
            type: String,
            enum: ["CASUAL", "SICK", "PAID", "UNPAID", "OTHER"],
            default: "PAID"
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        days: {
            type: Number,
            required: true,
            min: 0
        },

        reason: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Leave", leaveSchema);