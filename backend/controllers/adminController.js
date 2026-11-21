


const db = require("../config/db");
const bcrypt = require("bcrypt");

const {
    validateName,
    validateEmail,
    validatePassword,
    validateAddress
} = require("../utils/validators");

// 1. Admin dashboard
const getAdminDashboard = async (req, res) => {
    try {
        const [users] = await db.execute(
            "SELECT COUNT(*) AS totalUsers FROM users"
        );
        const [stores] = await db.execute(
            "SELECT COUNT(*) AS totalStores FROM stores"
        );
        const [ratings] = await db.execute(
            "SELECT COUNT(*) AS totalRatings FROM ratings"
        );

        return res.status(200).json({
            totalUsers: users[0].totalUsers,
            totalStores: stores[0].totalStores,
            totalRatings: ratings[0].totalRatings
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// 2. Admin creates a user
const createUser = async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof address !== "string"
        ) {
            return res.status(400).json({
                message: "All fields are required and must be valid text"
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedAddress = address.trim();

        if (!validateName(normalizedName)) {
            return res.status(400).json({
                message: "Name must be between 20 and 60 characters"
            });
        }

        if (!validateEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password must be 8-16 characters and include an uppercase letter and a special character"
            });
        }

        if (!validateAddress(normalizedAddress)) {
            return res.status(400).json({
                message: "Address cannot exceed 400 characters"
            });
        }

        const allowedRoles = ["ADMIN", "USER", "STORE_OWNER"];
        const selectedRole = role || "USER";

        if (!allowedRoles.includes(selectedRole)) {
            return res.status(400).json({ message: "Invalid user role" });
        }

        const [existingUser] = await db.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            `INSERT INTO users (name, email, password, address, role)
             VALUES (?, ?, ?, ?, ?)`,
            [
                normalizedName,
                normalizedEmail,
                hashedPassword,
                normalizedAddress,
                selectedRole
            ]
        );

        return res.status(201).json({
            message: "User created successfully",
            userId: result.insertId,
            role: selectedRole
        });
    } catch (error) {
        console.error("Create user error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// 3. Admin creates a store
const createStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof address !== "string" ||
            !owner_id
        ) {
            return res.status(400).json({
                message: "All store fields are required"
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedAddress = address.trim();

        if (!normalizedName || normalizedName.length > 100) {
            return res.status(400).json({
                message: "Store name is required and must not exceed 100 characters"
            });
        }

        if (!validateEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (!normalizedAddress || normalizedAddress.length > 400) {
            return res.status(400).json({
                message: "Address is required and cannot exceed 400 characters"
            });
        }

        const [owners] = await db.execute(
            "SELECT user_id FROM users WHERE user_id = ? AND role = 'STORE_OWNER'",
            [owner_id]
        );

        if (owners.length === 0) {
            return res.status(400).json({
                message: "Valid Store Owner not found"
            });
        }

        const [existingStore] = await db.execute(
            "SELECT store_id FROM stores WHERE email = ?",
            [normalizedEmail]
        );

        if (existingStore.length > 0) {
            return res.status(409).json({
                message: "Store email already exists"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO stores (name, email, address, owner_id)
             VALUES (?, ?, ?, ?)`,
            [normalizedName, normalizedEmail, normalizedAddress, owner_id]
        );

        return res.status(201).json({
            message: "Store created successfully",
            storeId: result.insertId
        });
    } catch (error) {
        console.error("Create store error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// 4. Admin views all stores with filters and sorting
const getAllStores = async (req, res) => {
    try {
        const { name, email, address, sortBy, order } = req.query;

        const allowedSortFields = {
            name: "s.name",
            email: "s.email",
            address: "s.address"
        };

        const sortColumn = allowedSortFields[sortBy] || "s.name";
        const sortOrder = order && order.toLowerCase() === "desc"
            ? "DESC"
            : "ASC";

        let sql = `
            SELECT
                s.store_id,
                s.name,
                s.email,
                s.address,
                COALESCE(AVG(r.rating), 0) AS averageRating
            FROM stores s
            LEFT JOIN ratings r ON s.store_id = r.store_id
            WHERE 1 = 1
        `;

        const params = [];

        if (name) {
            sql += " AND s.name LIKE ?";
            params.push(`%${name}%`);
        }

        if (email) {
            sql += " AND s.email LIKE ?";
            params.push(`%${email}%`);
        }

        if (address) {
            sql += " AND s.address LIKE ?";
            params.push(`%${address}%`);
        }

        sql += ` GROUP BY s.store_id ORDER BY ${sortColumn} ${sortOrder}`;

        const [stores] = await db.execute(sql, params);

        return res.status(200).json({
            totalStores: stores.length,
            stores
        });
    } catch (error) {
        console.error("Get stores error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// 5. Admin views all users with filters and sorting
const getAllUsers = async (req, res) => {
    try {
        const { name, email, address, role, sortBy, order } = req.query;

        const allowedSortFields = {
            name: "name",
            email: "email",
            address: "address",
            role: "role"
        };

        const sortColumn = allowedSortFields[sortBy] || "name";
        const sortOrder = order && order.toLowerCase() === "desc"
            ? "DESC"
            : "ASC";

        let sql = `
            SELECT user_id, name, email, address, role
            FROM users
            WHERE 1 = 1
        `;

        const params = [];

        if (name) {
            sql += " AND name LIKE ?";
            params.push(`%${name}%`);
        }

        if (email) {
            sql += " AND email LIKE ?";
            params.push(`%${email}%`);
        }

        if (address) {
            sql += " AND address LIKE ?";
            params.push(`%${address}%`);
        }

        if (role) {
            const allowedRoles = ["ADMIN", "USER", "STORE_OWNER"];

            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role filter" });
            }

            sql += " AND role = ?";
            params.push(role);
        }

        sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

        const [users] = await db.execute(sql, params);

        return res.status(200).json({
            totalUsers: users.length,
            users
        });
    } catch (error) {
        console.error("Get users error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getAdminDashboard,
    createUser,
    createStore,
    getAllStores,
    getAllUsers
};
