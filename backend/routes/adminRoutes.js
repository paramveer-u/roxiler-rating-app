


const express = require("express");
const router = express.Router();

const {
    getAdminDashboard,
    createUser,
    createStore,
    getAllStores,
    getAllUsers
} = require("../controllers/adminController");

const { getUserDetails } = require("../controllers/adminDetailsController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.get(
    "/dashboard",
    verifyToken,
    authorizeRoles("ADMIN"),
    getAdminDashboard
);

router.post(
    "/users",
    verifyToken,
    authorizeRoles("ADMIN"),
    createUser
);

router.post(
    "/stores",
    verifyToken,
    authorizeRoles("ADMIN"),
    createStore
);

router.get(
    "/stores",
    verifyToken,
    authorizeRoles("ADMIN"),
    getAllStores
);

router.get(
    "/users",
    verifyToken,
    authorizeRoles("ADMIN"),
    getAllUsers
);

router.get(
    "/users/:id",
    verifyToken,
    authorizeRoles("ADMIN"),
    getUserDetails
);

module.exports = router;
