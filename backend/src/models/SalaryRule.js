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

        type: {
            type: String,
            enum: ["EARNING", "DEDUCTION"],
            required: true
        },

        calculationType: {
            type: String,
            enum: ["FIXED", "PERCENTAGE"],
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
