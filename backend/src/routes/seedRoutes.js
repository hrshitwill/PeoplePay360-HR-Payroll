const express = require("express");
const router = express.Router();
const seedDatabase = require("../scripts/seed");
const seedLargeDataset = require("../scripts/seedLargeDataset");

router.post("/run", async (req, res) => {
    try {
        const { mode } = req.body || {};
        let result;
        if (mode === "small") {
            result = await seedDatabase();
        } else {
            // Default to the 400 employee enterprise dataset!
            result = await seedLargeDataset();
        }
        res.json({ success: true, message: "Database reseeded successfully!", result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
