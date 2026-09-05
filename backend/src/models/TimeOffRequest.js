const mongoose = require("mongoose");

const timeOffRequestSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },
        timeOffType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TimeOffType",
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        duration: {
            type: Number,
            required: true,
            min: 0.5
        },
        reason: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REFUSED"],
            default: "PENDING"
        },
        approvedBy: {
            type: String,
            default: null
        },
        approvalDate: {
            type: Date,
            default: null
        },
        rejectionReason: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("TimeOffRequest", timeOffRequestSchema);
