const mongoose = require("mongoose");

const payrunSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        periodStart: {
            type: Date,
            required: true
        },

        periodEnd: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["DRAFT", "COMPUTED", "VALIDATED", "PAID"],
            default: "DRAFT"
        },

        salaryStructure: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalaryStructure",
            required: true
        },

        employees: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee"
            }
        ],

        totalGross: {
            type: Number,
            default: 0
        },

        totalDeductions: {
            type: Number,
            default: 0
        },

        totalNet: {
            type: Number,
            default: 0
        },

        warnings: [
            {
                type: String
            }
        ],

        paidDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payrun", payrunSchema);