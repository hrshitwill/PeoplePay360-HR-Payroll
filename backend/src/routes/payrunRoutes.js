const express = require("express");
const router = express.Router();
const {
    getEligibleEmployees,
    getAllPayruns,
    getPayrunById,
    createPayrun,
    computePayrun,
    validatePayrun,
    markPaidPayrun,
    bulkSendEmails,
    deletePayrun
} = require("../controllers/payrunController");

router.get("/eligible-employees", getEligibleEmployees);
router.get("/", getAllPayruns);
router.get("/:id", getPayrunById);
router.post("/", createPayrun);
router.post("/:id/compute", computePayrun);
router.post("/:id/validate", validatePayrun);
router.post("/:id/mark-paid", markPaidPayrun);
router.post("/:id/send-emails", bulkSendEmails);
router.delete("/:id", deletePayrun);

module.exports = router;
