const mongoose = require("mongoose");

const timeOffAllocationSchema = new mongoose.Schema(
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

        numberOfDays: {
            type: Number,
            required: true,
            min: 0
        },

        dateFrom: {
            type: Date,
            required: true
        },

        dateTo: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["DRAFT", "APPROVED", "REFUSED"],
            default: "DRAFT"
        },

        taken: {
            type: Number,
            default: 0,
            min: 0
        },

        remaining: {
            type: Number,
            default: 0,
            min: 0
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

// Auto-compute remaining before save
timeOffAllocationSchema.pre("save", function (next) {
    this.remaining = Math.max(this.numberOfDays - this.taken, 0);
    next();
});

module.exports = mongoose.model("TimeOffAllocation", timeOffAllocationSchema);
