// backend/routes/cocktail.routes.js
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
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

// ---------- Normalize + strong validation ----------
const ensureImageMagicBytes = async (req, res, next) => {
    try {
        // If client used a different field name, normalize to req.file
        if (!req.file && Array.isArray(req.files) && req.files.length > 0) {
            req.file = req.files[0];
        }

        // No file at all → creating cocktail without image is allowed
        if (!req.file) return next();

        const detected = await fileTypeFromBuffer(req.file.buffer);
        if (!detected || !allowedMimes.includes(detected.mime)) {
            // A file was sent but it's not a permitted image
            return res.status(400).json({ error: "Only PNG/JPEG/WEBP allowed" });
        }

        const uploadsDir = path.resolve(process.cwd(), "backend", "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });

        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${detected.ext}`;
        const fullPath = path.join(uploadsDir, filename);
        await fs.writeFile(fullPath, req.file.buffer);

        // Populate Multer-like fields expected by the controller
        req.file.path = fullPath;
        req.file.filename = filename;
        req.file.mimetype = detected.mime;
        req.file.size = req.file.buffer.length;
        delete req.file.buffer;

        next();
    } catch (err) {
        next(err);
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
    ensureImageMagicBytes,      // strong validation + safe disk write
    requireValidImageIfProvided,
    validate([
        body("name").isString().trim().isLength({ min: 2, max: 100 }).withMessage("name must be 2–100 chars"),
        body("instructions").optional().isString().trim().isLength({ max: 4000 }),
        body("alcoholic").optional().isBoolean().withMessage("alcoholic must be boolean"),
        body("ingredients").optional().custom((v) => Array.isArray(v) || typeof v === "string"),
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
