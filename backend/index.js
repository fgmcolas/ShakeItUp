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

// Routes
import authRoutes from "./routes/auth.routes.js";
import cocktailRoutes from "./routes/cocktail.routes.js";
import userRoutes from "./routes/user.routes.js";
import ratingRoutes from "./routes/rating.routes.js";

// Load environment variables
dotenv.config();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy headers (Heroku, Nginx, etc.)
app.set("trust proxy", 1);

// Uploads directory
const uploadsDir = path.resolve(__dirname, process.env.UPLOADS_DIR || "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Remove X-Powered-By header
app.disable("x-powered-by");

// Security headers
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
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// HSTS (production only)
if (process.env.NODE_ENV === "production") {
    app.use(
        helmet.hsts({
            maxAge: 15552000, // 180 days
            includeSubDomains: true,
            preload: false,
        })
    );
}

// CORS
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

// Logging (development only)
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// JSON parser with limit
const maxJsonKb = Number(process.env.MAX_JSON_KB || 1024);
app.use(express.json({ limit: `${maxJsonKb}kb` })); // default = 1024kb (1 MB)

// Basic NoSQL injection guard
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
    next();
});

// Static files (uploads)
app.use(
    "/uploads",
    express.static(uploadsDir, {
        fallthrough: true,
        setHeaders: (res) => {
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("Cache-Control", "public, max-age=3600"); // cache 1 hour
            res.setHeader("Content-Disposition", "inline");
        },
    })
);

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 120,          // max 120 requests per minute
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutes
    limit: 10,                // max 10 attempts per window
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many login/register attempts, please try later." },
});
app.use("/api/auth", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cocktails", cocktailRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ratings", ratingRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
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
