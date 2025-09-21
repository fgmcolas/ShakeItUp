import express from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { fileTypeFromBuffer } from "file-type";
import { body, param, validationResult } from "express-validator";
import { createCocktail, getAllCocktails, getCocktailById } from "../controllers/cocktail.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Collect validation errors from express-validator
const validate = (rules) => [
    ...rules,
    (req, res, next) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            const details = result.array().map((e) => ({ field: e.param, msg: e.msg }));
            return res.status(400).json({ error: "Invalid data", details });
        }
        next();
    },
];

// Allowed image MIME types
const allowedMimes = ["image/png", "image/jpeg", "image/webp"];

// Multer: memory storage, 1 file, 2 MB limit
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 1, fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter: (req, file, cb) => {
        // Early filter: final check uses magic bytes below
        if (!allowedMimes.includes(file.mimetype)) {
            return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
        }
        cb(null, true);
    },
});

// Save a buffer to UPLOADS_DIR or /tmp/uploads; returns { fullPath, filename }
async function saveBufferToTmp(buffer, ext) {
    const uploadsDir = process.env.UPLOADS_DIR || path.join(os.tmpdir(), "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const fullPath = path.join(uploadsDir, filename);
    await fs.writeFile(fullPath, buffer);
    return { fullPath, filename };
}

// Ensure the uploaded file is a valid image by magic bytes and store it
const ensureImageMagicBytes = async (req, res, next) => {
    try {
        // Normalize: if files array exists, pick the first one
        if (!req.file && Array.isArray(req.files) && req.files.length > 0) {
            req.file = req.files[0];
        }

        // No image provided → continue
        if (!req.file) return next();

        // Detect type by content
        const detected = await fileTypeFromBuffer(req.file.buffer);
        if (!detected || !allowedMimes.includes(detected.mime)) {
            return next(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
        }

        // Save to disk (Heroku: /tmp/uploads is ephemeral)
        const { fullPath, filename } = await saveBufferToTmp(req.file.buffer, detected.ext);

        // Fill Multer-like fields for controller
        req.file.path = fullPath;         // absolute path in /tmp or UPLOADS_DIR
        req.file.filename = filename;     // final filename
        req.file.mimetype = detected.mime;
        req.file.size = req.file.buffer.length;

        next();
    } catch (err) {
        console.error("Image processing error:", err);
        return res
            .status(400)
            .json({ error: "Image processing failed", details: String(err.message || err) });
    }
};

// If client attempted to send a file but none was accepted, fail with 400
const requireValidImageIfProvided = (req, res, next) => {
    const triedToUpload =
        (Array.isArray(req.files) && req.files.length > 0) || typeof req.body.image !== "undefined";

    if (triedToUpload && !req.file) {
        return next({ statusCode: 400, message: "Invalid image. Only PNG/JPEG/WEBP up to 2MB." });
    }
    next();
};

// Create cocktail
router.post(
    "/",
    verifyToken,
    upload.any(),              // accept any field; first file is used
    ensureImageMagicBytes,     // strong validation + safe write
    requireValidImageIfProvided,
    validate([
        body("name").isString().trim().isLength({ min: 2, max: 100 }).withMessage("name must be 2–100 chars"),
        body("instructions").optional().isString().trim().isLength({ max: 4000 }),
        body("alcoholic").optional().isBoolean().toBoolean().withMessage("alcoholic must be boolean"),
        // Accept an array or a JSON string representing an array
        body("ingredients").optional().custom((v) => Array.isArray(v) || typeof v === "string"),
    ]),
    createCocktail
);

// Get all cocktails
router.get("/", getAllCocktails);

// Get one cocktail by id
router.get("/:id", validate([param("id").isMongoId().withMessage("Invalid id")]), getCocktailById);

export default router;
