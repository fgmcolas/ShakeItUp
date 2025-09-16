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

// Honor proxy headers when behind a reverse proxy (nginx, etc.)
app.set("trust proxy", 1);

/**
 * ------------------------------------------------------------------
 * FILE SYSTEM PREP
 * ------------------------------------------------------------------
 */
const uploadsDir = path.resolve(__dirname, process.env.UPLOADS_DIR || "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * ------------------------------------------------------------------
 * GLOBAL MIDDLEWARES
 * ------------------------------------------------------------------
 */

// Remove "X-Powered-By: Express" header
app.disable("x-powered-by");

// Security headers (helmet) + conservative CSP
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                frameAncestors: ["'none'"],
            },
        },
        referrerPolicy: { policy: "no-referrer" },
        crossOriginOpenerPolicy: { policy: "same-origin" },
        crossOriginEmbedderPolicy: false,
    })
);

// HSTS only in production
if (process.env.NODE_ENV === "production") {
    app.use(
        helmet.hsts({
            maxAge: 15552000, // 180 days
            includeSubDomains: true,
            preload: false,
        })
    );
}

// CORS whitelist
const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                return cb(null, true);
            }
            return cb(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// Logging (dev only)
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// JSON parser with conservative limit
const maxJsonKb = Number(process.env.MAX_JSON_KB || 1024);
app.use(express.json({ limit: `${maxJsonKb}kb` }));

/**
 * ------------------------------------------------------------------
 * BASIC ANTI–NoSQL INJECTION (Express 5 safe)
 * ------------------------------------------------------------------
 * Deeply removes keys starting with "$" or containing "." from req.body & req.params.
 * We purposely DO NOT touch req.query to avoid Express 5 getter issues.
 */
function deepSanitize(obj) {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete obj[key];
            continue;
        }
        const val = obj[key];
        if (val && typeof val === "object") deepSanitize(val);
    }
}

app.use((req, res, next) => {
    deepSanitize(req.body);
    deepSanitize(req.params);
    // If one day you need to sanitize query too, clone it first and sanitize the clone,
    // but avoid reassigning req.query on Express 5.
    next();
});

// Static serving for uploaded images
app.use(
    "/uploads",
    express.static(uploadsDir, {
        fallthrough: true,
        setHeaders: (res) => {
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("Cache-Control", "public, max-age=3600");
            res.setHeader("Content-Disposition", "inline");
        },
    })
);

/**
 * ------------------------------------------------------------------
 * RATE LIMITING
 * ------------------------------------------------------------------
 */
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
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
 */
app.use(notFound);
app.use(errorHandler);

/**
 * ------------------------------------------------------------------
 * DATABASE + SERVER BOOT
 * ------------------------------------------------------------------
 */
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Backend is running on port ${PORT}`);
            if (allowedOrigins.length) {
                console.log("CORS allowed origins:", allowedOrigins.join(", "));
            } else {
                console.log("CORS allowed origins: * (no CORS_ORIGINS set)");
            }
            console.log("Uploads directory:", uploadsDir);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exitCode = 1;
    });
