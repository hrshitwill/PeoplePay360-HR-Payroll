const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        payrun: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payrun",
            required: true
        },

        periodStart: {
            type: Date,
            required: true
        },

        periodEnd: {
            type: Date,
            required: true
        },

        contractSalary: {
            type: Number,
            required: true,
            min: 0
        },

        earnings: [
            {
                code: String,
                name: String,
                amount: Number
            }
        ],

        deductions: [
            {
                code: String,
                name: String,
                amount: Number
            }
        ],

        gross: {
            type: Number,
            required: true,
            min: 0
        },

        totalDeductions: {
            type: Number,
            required: true,
            min: 0
        },

        net: {
            type: Number,
            required: true
        },

        breakdown: [
            {
                code: String,
                name: String,
                type: {
                    type: String,
                    enum: ["EARNING", "DEDUCTION"]
                },
                calculationType: {
                    type: String,
                    enum: ["FIXED", "PERCENTAGE"]
                },
                amount: Number
            }
        ],

        status: {
            type: String,
            enum: ["GENERATED", "PAID"],
            default: "GENERATED"
        }
    },
    {
        timestamps: true
    }
);

// One employee can have only one payslip for one payrun
payslipSchema.index(
    { employee: 1, payrun: 1 },
    { unique: true }
);

module.exports = mongoose.model("Payslip", payslipSchema);