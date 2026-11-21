
const db = require("../config/db");

// Normal User views all stores and searches by name/address
const getAllStoresForUser = async (req, res) => {
    try {
        const { name, address } = req.query;
        const userId = req.user.userId;

        let sql = `
            SELECT
                s.store_id,
                s.name,
                s.address,
                COALESCE(AVG(allRatings.rating), 0) AS averageRating,
                MAX(myRating.rating) AS myRating
            FROM stores s
            LEFT JOIN ratings allRatings
                ON s.store_id = allRatings.store_id
            LEFT JOIN ratings myRating
                ON s.store_id = myRating.store_id
                AND myRating.user_id = ?
            WHERE 1 = 1
        `;

        const params = [userId];

        if (name) {
            sql += " AND s.name LIKE ?";
            params.push(`%${name}%`);
        }

        if (address) {
            sql += " AND s.address LIKE ?";
            params.push(`%${address}%`);
        }

        sql += " GROUP BY s.store_id ORDER BY s.name ASC";

        const [stores] = await db.execute(sql, params);

        return res.status(200).json({
            totalStores: stores.length,
            stores
        });
    } catch (error) {
        console.error("User store listing error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Normal User submits or modifies a store rating
const submitOrUpdateRating = async (req, res) => {
    try {
        const userId = req.user.userId;
        const storeId = Number(req.params.storeId);
        const { rating } = req.body;

        if (!Number.isInteger(storeId) || storeId <= 0) {
            return res.status(400).json({
                message: "Invalid store ID"
            });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be an integer between 1 and 5"
            });
        }

        const [stores] = await db.execute(
            "SELECT store_id FROM stores WHERE store_id = ?",
            [storeId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        // Insert a new rating or update the existing rating
        await db.execute(
            `INSERT INTO ratings (user_id, store_id, rating)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
             rating = VALUES(rating),
             updated_at = CURRENT_TIMESTAMP`,
            [userId, storeId, rating]
        );

        return res.status(200).json({
            message: "Rating submitted or updated successfully",
            storeId,
            rating
        });

    } catch (error) {
        console.error("Submit rating error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    getAllStoresForUser,
    submitOrUpdateRating
};
