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
            uppercase: true,
            trim: true
        },
        sequence: {
            type: Number,
            required: true,
            default: 10
        },
        category: {
            type: String,
            enum: ["BASIC", "ALLOWANCE", "GROSS", "DEDUCTION", "CONTRIBUTION", "NET"],
            required: true,
            default: "ALLOWANCE"
        },
        type: {
            type: String,
            enum: ["EARNING", "DEDUCTION", "INFORMATIONAL"],
            required: true,
            default: "EARNING"
        },
        calculationType: {
            type: String,
            enum: ["FIXED", "PERCENTAGE", "FORMULA"],
            required: true,
            default: "FIXED"
        },
        amount: {
            type: Number,
            default: 0
        },
        percentage: {
            type: Number,
            default: 0
        },
        percentageOf: {
            type: String,
            enum: ["BASE", "GROSS", "BASIC_PLUS_ALLOWANCE"],
            default: "BASE"
        },
        formula: {
            type: String,
            default: ""
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

module.exports = mongoose.model("SalaryRule", salaryRuleSchema);
