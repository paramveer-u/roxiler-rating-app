
const db = require("../config/db");
const bcrypt = require("bcrypt");

const { validatePassword } = require("../utils/validators");

// Change password for any authenticated user
const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string"
        ) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                message: "New password must be 8-16 characters and include an uppercase letter and a special character"
            });
        }

        const [users] = await db.execute(
            "SELECT password FROM users WHERE user_id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const passwordMatches = await bcrypt.compare(
            currentPassword,
            users[0].password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Current password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.execute(
            "UPDATE users SET password = ? WHERE user_id = ?",
            [hashedPassword, userId]
        );

        return res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = { changePassword };
