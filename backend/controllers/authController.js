

const db = require("../config/db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    validateName,
    validateEmail,
    validatePassword,
    validateAddress
} = require("../utils/validators");

// User Registration Controller
const registerUser = async (req, res) => {
    try {
        // 1. Get user details from request body
        const { name, email, password, address } = req.body;

        // 2. Check whether all required fields are provided
        if (!name || !email || !password || !address) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // 3. Validate user details
        if (!validateName(name)) {
            return res.status(400).json({
                message: "Name must be between 20 and 60 characters"
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password must be 8–16 characters and contain at least one uppercase letter and one special character"
            });
        }

        if (!validateAddress(address)) {
            return res.status(400).json({
                message: "Address cannot exceed 400 characters"
            });
        }

        // 4. Check whether email already exists
        const [existingUsers] = await db.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        // 5. Encrypt the password
       
        const hashedPassword = await bcrypt.hash(password, 10);

        // 6. Insert new user into MySQL
        const [result] = await db.execute(
            `INSERT INTO users (name, email, password, address, role)
             VALUES (?, ?, ?, ?, ?)`,
            [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), "USER"]
        );

        // 7. Send successful response
        return res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }

};

// User Login Controller
const loginUser = async (req, res) => {
    try {
        // 1. Get email and password
        const { email, password } = req.body;

        // 2. Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 3. Validate email
        if (!validateEmail(email)) {
            return res.status(400).json({
                message: "Invalid email address"
            });
        }

        // 4. Find user in database
        const [users] = await db.execute(
            "SELECT user_id, name, email, password, role FROM users WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // 5. Compare entered password with stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 6. Generate JWT token
        const token = jwt.sign(
            {
                userId: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 7. Send successful response
        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Export controllers
module.exports = {
    registerUser,
    loginUser
};
