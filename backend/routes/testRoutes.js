
const express = require("express");

const router = express.Router();

// Import authentication and authorization middleware
const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Test 1: Check authentication
router.get("/profile", verifyToken, (req, res) => {
    res.status(200).json({
        message: "Authentication successful",
        user: req.user
    });
});

// Test 2: Check ADMIN role
router.get(
    "/admin",
    verifyToken,
    authorizeRoles("ADMIN"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome Admin! Access granted."
        });
    }
);

module.exports = router;
