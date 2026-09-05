const mongoose = require("mongoose");

const payslipLineSchema = new mongoose.Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    category: {
        type: String,
        enum: ["BASIC", "ALLOWANCE", "GROSS", "DEDUCTION", "CONTRIBUTION", "NET"],
        required: true
    },
    sequence: { type: Number, default: 10 },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["EARNING", "DEDUCTION", "INFORMATIONAL"], required: true }
});

const payslipSchema = new mongoose.Schema(
    {
        payslipNumber: {
            type: String,
            unique: true
        },
        payrun: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payrun",
            required: true
        },
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },
        contract: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contract"
        },
        salaryStructure: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalaryStructure"
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
        workedDays: {
            type: Number,
            default: 22
        },
        totalWorkingDays: {
            type: Number,
            default: 22
        },
        lines: [payslipLineSchema],
        basicSalary: {
            type: Number,
            default: 0
        },
        totalAllowances: {
            type: Number,
            default: 0
        },
        grossSalary: {
            type: Number,
            default: 0
        },
        totalDeductions: {
            type: Number,
            default: 0
        },
        netSalary: {
            type: Number,
            default: 0
        },
        warnings: [
            {
                type: { type: String },
                message: { type: String },
                severity: { type: String, enum: ["WARNING", "ERROR", "INFO"], default: "WARNING" }
            }
        ],
        emailStatus: {
            type: String,
            enum: ["PENDING", "SENT", "FAILED"],
            default: "PENDING"
        },
        sentAt: {
            type: Date,
            default: null
        },
        paidAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Generate payslipNumber if not present
payslipSchema.pre("save", function () {
    if (!this.payslipNumber) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        this.payslipNumber = `PS-${Date.now().toString().slice(-6)}-${rand}`;
    }
});

module.exports = mongoose.model("Payslip", payslipSchema);
