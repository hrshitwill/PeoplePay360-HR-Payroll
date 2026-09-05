const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret");
            req.user = await User.findById(decoded.id).select("-password").populate("linkedEmployee");
            if (!req.user) {
                return res.status(401).json({ success: false, message: "User not found with this token" });
            }
            return next();
        } catch (error) {
            return res.status(401).json({ success: false, message: "Not authorized, token invalid or expired" });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user?.role || "UNKNOWN"}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
