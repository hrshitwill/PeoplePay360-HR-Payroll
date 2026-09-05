const express = require("express");

const {
    register,
    login,
    getCurrentUser,
    getUsers,
    updateUser
} = require("../controllers/authController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", auth, getCurrentUser);

// Admin / HR Manager routes
router.get("/", auth, authorize("ADMIN", "HR_MANAGER"), getUsers);
router.put("/:id", auth, authorize("ADMIN"), updateUser);

module.exports = router;
