const mongoose = require("mongoose");

const payrunSchema = new mongoose.Schema(
    {
        payrunBatchNumber: {
            type: String,
            trim: true
        },
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
                employeeId: { type: String },
                employeeName: { type: String },
                type: { type: String },
                message: { type: String },
                severity: { type: String, enum: ["WARNING", "ERROR", "INFO"], default: "WARNING" }
            }
        ],
        validationNotes: {
            type: String,
            default: ""
        },
        paidAt: {
            type: Date,
            default: null
        },
        sentAt: {
            type: Date,
            default: null
        },
        emailCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

payrunSchema.virtual("payslips", {
    ref: "Payslip",
    localField: "_id",
    foreignField: "payrun"
});

payrunSchema.pre("save", function () {
    if (!this.payrunBatchNumber) {
        this.payrunBatchNumber = `PR-${Date.now().toString().slice(-6)}`;
    }
});

module.exports = mongoose.model("Payrun", payrunSchema);