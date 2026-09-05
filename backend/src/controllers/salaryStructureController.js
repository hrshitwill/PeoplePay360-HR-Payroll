const SalaryStructure = require("../models/SalaryStructure");
const Contract = require("../models/Contract");

const getAllStructures = async (req, res) => {
    try {
        const structures = await SalaryStructure.find()
            .populate({
                path: "rules",
                options: { sort: { sequence: 1 } }
            })
            .sort({ createdAt: -1 });

        // Augment with active contract counts
        const enhanced = await Promise.all(
            structures.map(async (st) => {
                const employeeCount = await Contract.countDocuments({
                    salaryStructure: st._id,
                    status: "ACTIVE"
                });
                const obj = st.toObject();
                obj.assignedEmployeesCount = employeeCount;
                obj.rulesCount = st.rules ? st.rules.length : 0;
                return obj;
            })
        );

        res.json({ success: true, count: enhanced.length, data: enhanced });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStructureById = async (req, res) => {
    try {
        const structure = await SalaryStructure.findById(req.params.id).populate({
            path: "rules",
            options: { sort: { sequence: 1 } }
        });

        if (!structure) {
            return res.status(404).json({ success: false, message: "Salary structure not found" });
        }

        const employeeCount = await Contract.countDocuments({
            salaryStructure: structure._id,
            status: "ACTIVE"
        });

        const obj = structure.toObject();
        obj.assignedEmployeesCount = employeeCount;

        res.json({ success: true, data: obj });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createStructure = async (req, res) => {
    try {
        const structure = await SalaryStructure.create(req.body);
        const populated = await SalaryStructure.findById(structure._id).populate("rules");
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateStructure = async (req, res) => {
    try {
        const structure = await SalaryStructure.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate({
            path: "rules",
            options: { sort: { sequence: 1 } }
        });

        if (!structure) {
            return res.status(404).json({ success: false, message: "Salary structure not found" });
        }

        res.json({ success: true, data: structure });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteStructure = async (req, res) => {
    try {
        const structure = await SalaryStructure.findByIdAndDelete(req.params.id);
        if (!structure) {
            return res.status(404).json({ success: false, message: "Salary structure not found" });
        }
        res.json({ success: true, message: "Salary structure deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllStructures,
    getStructureById,
    createStructure,
    updateStructure,
    deleteStructure
};
