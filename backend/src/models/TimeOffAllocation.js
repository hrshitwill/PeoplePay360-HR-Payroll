const mongoose = require("mongoose");

const timeOffAllocationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: "Annual Leave Allocation"
        },
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
        allocatedUnits: {
            type: Number,
            required: true,
            min: 0
        },
        takenUnits: {
            type: Number,
            default: 0,
            min: 0
        },
        remainingUnits: {
            type: Number,
            default: 0
        },
        validityStartDate: {
            type: Date,
            required: true
        },
        validityEndDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["DRAFT", "APPROVED", "REFUSED"],
            default: "APPROVED"
        },
        approvedBy: {
            type: String,
            default: "HR Manager"
        },
        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// Pre-save to compute remainingUnits
timeOffAllocationSchema.pre("save", function () {
    this.remainingUnits = Math.max(0, this.allocatedUnits - this.takenUnits);
});

module.exports = mongoose.model("TimeOffAllocation", timeOffAllocationSchema);
