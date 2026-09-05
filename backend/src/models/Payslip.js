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

        contract: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contract",
            default: null
        },

        salaryStructure: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalaryStructure",
            default: null
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

        workedDays: {
            type: Number,
            default: 0
        },

        earnings: [
            {
                code: String,
                name: String,
                category: String,
                amount: Number
            }
        ],

        deductions: [
            {
                code: String,
                name: String,
                category: String,
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
                category: String,
                type: {
                    type: String,
                    enum: ["EARNING", "DEDUCTION"]
                },
                calculationType: {
                    type: String,
                    enum: ["FIXED", "PERCENTAGE", "FORMULA"]
                },
                amount: Number
            }
        ],

        warnings: [
            {
                type: String
            }
        ],

        status: {
            type: String,
            enum: ["DRAFT", "GENERATED", "VALIDATED", "PAID"],
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