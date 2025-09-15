/**
 * Middleware: notFound
 * -------------------------
 * Called when no route matches the request.
 * Always respond with HTTP 404.
 */
import multer from "multer";

export function notFound(req, res, next) {
    res.status(404).json({ error: "Route not found" });
}

/**
 * Middleware: errorHandler
 * -------------------------
 * Centralized error handling.
 * - Handles Multer upload errors (size limits, etc.)
 * - Handles common DB / validation errors
 * - Allows custom { statusCode, message } errors
 * - Fallback: HTTP 500 with a generic message
 */
export function errorHandler(err, req, res, next) {
    // Multer errors (e.g., file too large, too many files, etc.)
    if (err instanceof multer.MulterError) {
        console.error("[MULTER ERROR]", err);
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "Image too large (max 2MB)" });
        }
        return res.status(400).json({ error: err.message || "Upload error" });
    }

    // Our own explicit errors with status code (throw { statusCode, message })
    if (err && err.statusCode && err.message) {
        console.error("[EXPLICIT ERROR]", err);
        return res.status(err.statusCode).json({ error: err.message });
    }

    // Validation error (custom type you can set in controllers)
    if (err?.type === "validation") {
        console.error("[VALIDATION ERROR]", err);
        return res
            .status(400)
            .json({ error: "Invalid data", details: err.details || [] });
    }

    // Invalid MongoDB ObjectId
    if (err?.name === "CastError") {
        console.error("[CAST ERROR]", err);
        return res.status(400).json({ error: "Invalid id format" });
    }

    // Duplicate key (unique index in Mongo)
    if (err?.code === 11000) {
        console.error("[DUPLICATE KEY]", err);
        return res.status(409).json({ error: "Duplicate key detected" });
    }

    // Log the error for debugging (server side only)
    console.error("[SERVER ERROR]", err);

    // Default: internal server error
    res.status(500).json({ error: "Server error" });
}
