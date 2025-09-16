import express from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { fileTypeFromBuffer } from "file-type";
import { body, param, validationResult } from "express-validator";

import {
    createCocktail,
    getAllCocktails,
    getCocktailById,
} from "../controllers/cocktail.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// ---------- validation helper ----------
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

// ---------- Multer (memory + early mimetype check) ----------
const allowedMimes = ["image/png", "image/jpeg", "image/webp"];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 1, fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter: (req, file, cb) => {
        // Best-effort early filter; the magic-bytes check below is the strong gate.
        if (!allowedMimes.includes(file.mimetype)) {
            return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
        }
        cb(null, true);
    },
});

// ---------- helpers: save buffer to /tmp ----------
/**
 * Save buffer to /tmp (Heroku writable, but ephemeral).
 * Returns { fullPath, filename }.
 */
async function saveBufferToTmp(buffer, ext) {
    // On Heroku the only reliable writable dir is /tmp. Files are ephemeral.
    const uploadsDir = process.env.UPLOADS_DIR || path.join(os.tmpdir(), "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const fullPath = path.join(uploadsDir, filename);
    await fs.writeFile(fullPath, buffer);
    return { fullPath, filename };
}

// ---------- Normalize + strong validation + store ----------
const ensureImageMagicBytes = async (req, res, next) => {
    try {
        // Normalize: if Multer stored files in req.files, pick the first one
        if (!req.file && Array.isArray(req.files) && req.files.length > 0) {
            req.file = req.files[0];
        }

        // If no file was uploaded, allow cocktail creation without image
        if (!req.file) return next();

        // Detect real file type by magic bytes (buffer content)
        const detected = await fileTypeFromBuffer(req.file.buffer);
        if (!detected || !allowedMimes.includes(detected.mime)) {
            return res.status(400).json({ error: "Only PNG/JPEG/WEBP allowed" });
        }

        // Save to /tmp (Heroku). Remember: ephemeral storage.
        const { fullPath, filename } = await saveBufferToTmp(
            req.file.buffer,
            detected.ext
        );

        // Populate Multer-like fields so controller can use them
        req.file.path = fullPath;        // absolute path in /tmp
        req.file.filename = filename;    // file name saved
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

/**
 * Safety net: if the client tried to send *some* file (any field),
 * but we ended up with no valid req.file, fail with 400 so we don't
 * silently "succeed without image".
 */
const requireValidImageIfProvided = (req, res, next) => {
    const triedToUpload =
        (Array.isArray(req.files) && req.files.length > 0) ||
        typeof req.body.image !== "undefined";

    if (triedToUpload && !req.file) {
        return res
            .status(400)
            .json({ error: "Invalid image. Only PNG/JPEG/WEBP up to 2MB." });
    }
    next();
};

// ---------- Routes ----------
router.post(
    "/",
    verifyToken,
    upload.any(),               // capture file regardless of field name
    ensureImageMagicBytes,      // strong validation + safe write to /tmp
    requireValidImageIfProvided,
    validate([
        body("name")
            .isString()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("name must be 2–100 chars"),
        body("instructions").optional().isString().trim().isLength({ max: 4000 }),
        body("alcoholic")
            .optional()
            .isBoolean()
            .withMessage("alcoholic must be boolean"),
        // Accept either an array or a JSON string representation of an array
        body("ingredients")
            .optional()
            .custom((v) => Array.isArray(v) || typeof v === "string"),
    ]),
    createCocktail
);

router.get("/", getAllCocktails);

router.get(
    "/:id",
    validate([param("id").isMongoId().withMessage("Invalid id")]),
    getCocktailById
);

export default router;
