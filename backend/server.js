require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

// Security Headers
app.use(helmet());

// Rate Limiting — 300 req/15min per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
});
app.use(limiter);

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/supermarkets", require("./routes/supermarketRoutes"));
app.use("/api/delivery", require("./routes/deliveryRoutes"));

// Health Check
app.get("/", (req, res) => {
    res.json({ message: "TownKart API v2.0 Running ✅", status: "OK" });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 TownKart server running on http://localhost:${PORT}`);
});