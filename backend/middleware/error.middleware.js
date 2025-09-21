import multer from "multer";

// 404 for unknown routes
export function notFound(req, res, next) {
    res.status(404).json({ error: "Route not found" });
}

// Centralized error handler
export function errorHandler(err, req, res, next) {
    // Multer upload errors (size, format, count...)
    if (err?.name === "MulterError" || err instanceof multer.MulterError) {
        if (process.env.NODE_ENV !== "production") {
            console.error("[MULTER ERROR]", err);
        }

        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "Image too large (max 2MB)" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ error: "Invalid file format" });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({ error: "Only one image allowed" });
        }
        return res.status(400).json({ error: err.message || "Upload error" });
    }

    // Explicit application errors: throw { statusCode, message }
    if (err && err.statusCode && err.message) {
        if (process.env.NODE_ENV !== "production") {
            console.error("[EXPLICIT ERROR]", err);
        }
        return res.status(err.statusCode).json({ error: err.message });
    }

    // Validation aggregator (optional from controllers)
    if (err?.type === "validation") {
        if (process.env.NODE_ENV !== "production") {
            console.error("[VALIDATION ERROR]", err);
        }
        return res.status(400).json({ error: "Invalid data", details: err.details || [] });
    }

    // Mongo errors
    if (err?.name === "CastError") {
        if (process.env.NODE_ENV !== "production") {
            console.error("[CAST ERROR]", err);
        }
        return res.status(400).json({ error: "Invalid id format" });
    }
    if (err?.code === 11000) {
        if (process.env.NODE_ENV !== "production") {
            console.error("[DUPLICATE KEY]", err);
        }
        return res.status(409).json({ error: "Duplicate key detected" });
    }

    // Fallback
    if (process.env.NODE_ENV !== "production") {
        console.error("[SERVER ERROR]", err);
    }
    res.status(500).json({ error: "Server error" });
}
