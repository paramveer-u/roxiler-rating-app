
const db = require("../config/db");

// Admin views an individual user's details
const getUserDetails = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const [users] = await db.execute(
            `SELECT
                u.user_id,
                u.name,
                u.email,
                u.address,
                u.role
             FROM users u
             WHERE u.user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = users[0];

        // For Store Owners, get their store and average rating
        if (user.role === "STORE_OWNER") {
            const [stores] = await db.execute(
                `SELECT
                    s.store_id,
                    s.name AS storeName,
                    COALESCE(AVG(r.rating), 0) AS averageRating
                 FROM stores s
                 LEFT JOIN ratings r ON s.store_id = r.store_id
                 WHERE s.owner_id = ?
                 GROUP BY s.store_id`,
                [userId]
            );

            user.stores = stores;
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error("Get user details error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = { getUserDetails };
