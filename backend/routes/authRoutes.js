

const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const {
    changePassword
} = require("../controllers/passwordController");

const {
    verifyToken
} = require("../middleware/authMiddleware");

// User registration
router.post("/register", registerUser);

// User login
router.post("/login", loginUser);

// Change password for authenticated users
router.put("/change-password", verifyToken, changePassword);

module.exports = router;
