const mongoose = require("mongoose");

const salaryRuleSchema = new mongoose.Schema(
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
            trim: true
        },

        sequence: {
            type: Number,
            required: true
        },

        category: {
            type: String,
            enum: ["BASIC", "ALLOWANCE", "GROSS", "DEDUCTION", "NET"],
            required: true
        },

        type: {
            type: String,
            enum: ["EARNING", "DEDUCTION"],
            required: true
        },

        calculationType: {
            type: String,
            enum: ["FIXED", "PERCENTAGE", "FORMULA"],
            required: true
        },

        amount: {
            type: Number,
            default: 0
        },

        percentage: {
            type: Number,
            default: 0
        },

        // Code reference for percentage-of calculations (e.g., "BASIC" means % of Basic)
        percentageOf: {
            type: String,
            default: "BASE"
        },

        // Formula string for FORMULA type (e.g., "BASIC * 0.4")
        formula: {
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

module.exports = mongoose.model("SalaryRule", salaryRuleSchema);
