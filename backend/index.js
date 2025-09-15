// Core dependencies
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

// Security dependencies
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Error handling middleware
import { notFound, errorHandler } from "./middleware/error.middleware.js";

// Route modules
import authRoutes from "./routes/auth.routes.js";
import cocktailRoutes from "./routes/cocktail.routes.js";
import userRoutes from "./routes/user.routes.js";
import ratingRoutes from "./routes/rating.routes.js";

// Load environment variables from .env file
dotenv.config();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * ------------------------------------------------------------------
 * FILE SYSTEM PREP
 * ------------------------------------------------------------------
 * Make sure the "uploads" directory exists. This is where verified
 * images will be persisted by the cocktail routes after validation.
 */
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

/**
 * ------------------------------------------------------------------
 * GLOBAL MIDDLEWARES
 * ------------------------------------------------------------------
 */

// Sets secure HTTP headers (helps mitigate common attacks)
app.use(helmet());

// Enable CORS. In production, restrict "origin" to your frontend URL.
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

// Development-friendly request logging
app.use(morgan("dev"));

// Parse JSON request bodies with a conservative size limit
app.use(express.json({ limit: "1mb" }));

// Serve uploaded images statically from /uploads/*
app.use("/uploads", express.static(uploadsDir));

/**
 * ------------------------------------------------------------------
 * RATE LIMITING (SECURITY)
 * ------------------------------------------------------------------
 * Throttle brute-force attempts on auth endpoints.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,                // max 10 requests per IP per window
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many login/register attempts, please try later." },
});
app.use("/api/auth", authLimiter);

/**
 * ------------------------------------------------------------------
 * ROUTES
 * ------------------------------------------------------------------
 */
app.use("/api/auth", authRoutes);
app.use("/api/cocktails", cocktailRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ratings", ratingRoutes);

/**
 * ------------------------------------------------------------------
 * ERROR HANDLING
 * ------------------------------------------------------------------
 * notFound → converts unmatched routes to a 404
 * errorHandler → centralizes all thrown/rejected errors and Multer errors
 */
app.use(notFound);
app.use(errorHandler);

/**
 * ------------------------------------------------------------------
 * DATABASE + SERVER BOOT
 * ------------------------------------------------------------------
 * Only start listening once MongoDB is connected.
 */
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Backend is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });
