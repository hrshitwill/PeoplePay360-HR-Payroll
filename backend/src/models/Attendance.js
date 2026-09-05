const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        checkIn: {
            type: Date,
            default: null
        },
        checkOut: {
            type: Date,
            default: null
        },
        workedHours: {
            type: Number,
            default: 0
        },
        expectedHours: {
            type: Number,
            default: 8
        },
        status: {
            type: String,
            enum: ["PRESENT", "LATE", "HALF_DAY", "ABSENT", "OVERTIME", "MISSING_CHECKOUT"],
            default: "PRESENT"
        },
        isManuallyCorrected: {
            type: Boolean,
            default: false
        },
        correctionReason: {
            type: String,
            default: ""
        },
        correctedBy: {
            type: String,
            default: ""
        },
        originalRecord: {
            checkIn: { type: Date, default: null },
            checkOut: { type: Date, default: null },
            workedHours: { type: Number, default: 0 }
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

// Pre-save calculation for workedHours and status if checkIn and checkOut exist
attendanceSchema.pre("save", function () {
    if (this.checkIn && this.checkOut) {
        const diffMs = new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime();
        const hours = Math.max(0, diffMs / (1000 * 60 * 60));
        this.workedHours = Number(hours.toFixed(2));

        if (this.workedHours > this.expectedHours + 0.5) {
            this.status = "OVERTIME";
        } else if (this.workedHours < this.expectedHours / 2) {
            this.status = "HALF_DAY";
        } else if (!this.status || this.status === "MISSING_CHECKOUT") {
            this.status = "PRESENT";
        }
    } else if (this.checkIn && !this.checkOut) {
        this.status = "MISSING_CHECKOUT";
    }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
