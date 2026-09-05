const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema(
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
        description: {
            type: String,
            default: ""
        },
        rules: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SalaryRule"
            }
        ],
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("SalaryStructure", salaryStructureSchema);
