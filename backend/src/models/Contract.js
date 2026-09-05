const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
    {
        contractReference: {
            type: String,
            trim: true
        },
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },
        contractType: {
            type: String,
            enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"],
            default: "FULL_TIME"
        },
        jobPosition: {
            type: String,
            default: ""
        },
        department: {
            type: String,
            default: ""
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
        wageType: {
            type: String,
            enum: ["MONTHLY", "HOURLY", "ANNUAL"],
            default: "MONTHLY"
        },
        salaryStructure: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalaryStructure",
            default: null
        },
        workingSchedule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkingSchedule",
            default: null
        },
        workingHoursPerWeek: {
            type: Number,
            default: 40
        },
        status: {
            type: String,
            enum: ["ACTIVE", "DRAFT", "EXPIRED", "TERMINATED"],
            default: "ACTIVE"
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

// Pre-save auto reference generator if missing
contractSchema.pre("save", function () {
    if (!this.contractReference) {
        this.contractReference = `CNT-${Math.floor(100000 + Math.random() * 900000)}`;
    }
});

module.exports = mongoose.model("Contract", contractSchema);