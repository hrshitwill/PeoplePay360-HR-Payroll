const express = require("express");

const {
    createPayrun,
    getPayruns,
    getPayrunById,
    validatePayrun,
    computePayrun
} = require("../controllers/payrunController");

const router = express.Router();

router.post("/", createPayrun);
router.get("/", getPayruns);
router.post("/:id/compute", computePayrun);
router.get("/:id", getPayrunById);
router.post("/:id/validate", validatePayrun);
module.exports = router;