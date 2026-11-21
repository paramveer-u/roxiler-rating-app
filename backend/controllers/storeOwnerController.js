
const db = require("../config/db");

// Store Owner dashboard
const getStoreOwnerDashboard = async (req, res) => {
    try {
        const ownerId = req.user.userId;

        // Find stores belonging to the logged-in owner
        const [stores] = await db.execute(
            `SELECT store_id, name, email, address
             FROM stores
             WHERE owner_id = ?`,
            [ownerId]
        );

        if (stores.length === 0) {
            return res.status(200).json({
                totalStores: 0,
                stores: []
            });
        }

        // Get ratings and average rating for each store
        const dashboardStores = await Promise.all(
            stores.map(async (store) => {
                const [averageResult] = await db.execute(
                    `SELECT COALESCE(AVG(rating), 0) AS averageRating
                     FROM ratings
                     WHERE store_id = ?`,
                    [store.store_id]
                );

                const [ratings] = await db.execute(
                    `SELECT
                        u.user_id,
                        u.name,
                        u.email,
                        r.rating,
                        r.created_at
                     FROM ratings r
                     JOIN users u ON r.user_id = u.user_id
                     WHERE r.store_id = ?
                     ORDER BY r.created_at DESC`,
                    [store.store_id]
                );

                return {
                    ...store,
                    averageRating: averageResult[0].averageRating,
                    totalRatings: ratings.length,
                    ratings
                };
            })
        );

        return res.status(200).json({
            totalStores: dashboardStores.length,
            stores: dashboardStores
        });

    } catch (error) {
        console.error("Store Owner dashboard error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    getStoreOwnerDashboard
};
