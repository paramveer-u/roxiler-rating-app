


const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const storeOwnerRoutes = require("./routes/storeOwnerRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/store-owner", storeOwnerRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("Roxiler Rating Application Backend is Running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Test MySQL connection
db.getConnection()
    .then(connection => {
        console.log("MySQL database connected successfully!");
        connection.release();
    })
    .catch(error => {
        console.error("MySQL connection failed:", error.message);
    });
