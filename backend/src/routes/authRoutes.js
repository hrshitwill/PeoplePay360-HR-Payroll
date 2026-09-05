const express = require("express");
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    getMe,
    demoLogin,
    getAvailableRoles
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/demo-login", demoLogin);
router.get("/me", protect, getMe);
router.get("/roles", getAvailableRoles);

module.exports = router;
