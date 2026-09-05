const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        contractType: {
            type: String,
            enum: ["FULL_TIME", "PART_TIME", "CONTRACT"],
            default: "FULL_TIME"
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            default: null
        },

        salary: {
            type: Number,
            required: true,
            min: 0
        },

        salaryStructure: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalaryStructure",
            default: null
        },

        workingHoursPerWeek: {
            type: Number,
            default: 40
        },

        status: {
            type: String,
            enum: ["ACTIVE", "EXPIRED", "TERMINATED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Contract", contractSchema);