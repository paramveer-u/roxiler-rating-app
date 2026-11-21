
const express = require("express");
const router = express.Router();

const {
    getStoreOwnerDashboard
} = require("../controllers/storeOwnerController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.get(
    "/dashboard",
    verifyToken,
    authorizeRoles("STORE_OWNER"),
    getStoreOwnerDashboard
);

module.exports = router;
