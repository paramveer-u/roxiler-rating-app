

const express = require("express");
const router = express.Router();

const {
    getAllStoresForUser,
    submitOrUpdateRating
} = require("../controllers/userController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Normal User views and searches stores
router.get(
    "/stores",
    verifyToken,
    authorizeRoles("USER"),
    getAllStoresForUser
);

// Normal User submits or updates a rating
router.post(
    "/ratings/:storeId",
    verifyToken,
    authorizeRoles("USER"),
    submitOrUpdateRating
);

module.exports = router;
