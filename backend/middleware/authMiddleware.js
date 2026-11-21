

const jwt = require("jsonwebtoken");

// Authentication Middleware
const verifyToken = (req, res, next) => {
    try {
        // 1. Get token from request headers
        const authHeader = req.headers.authorization;

        // 2. Check whether token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        // 3. Extract token
        const token = authHeader.split(" ")[1];

        // 4. Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Store decoded user details in request
        req.user = decoded;

        // 6. Continue to the next middleware or controller
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

// Role-Based Authorization Middleware
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        // Check whether the user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied. You do not have permission."
            });
        }

        // Allow access
        next();
    };
};

// Export middleware
module.exports = {
    verifyToken,
    authorizeRoles
};
