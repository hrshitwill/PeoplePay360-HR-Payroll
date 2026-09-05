const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        phone: {
            type: String,
            default: ""
        },
        department: {
            type: String,
            default: "Engineering"
        },
        jobTitle: {
            type: String,
            default: "Software Engineer"
        },
        employmentType: {
            type: String,
            enum: ["FULL_TIME", "PART_TIME", "CONTRACT"],
            default: "FULL_TIME"
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null
        },
        workingSchedule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkingSchedule",
            default: null
        },
        joiningDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        },
        avatar: {
            type: String,
            default: ""
        },
        bankDetails: {
            bankName: { type: String, default: "" },
            accountNumber: { type: String, default: "" },
            ifscRouting: { type: String, default: "" },
            accountHolderName: { type: String, default: "" }
        },
        address: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

employeeSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("Employee", employeeSchema);