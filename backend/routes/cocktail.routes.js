// Import express to create a router
import express from "express";

// Multer is used for file uploads (e.g., cocktail images)
import multer from "multer";
import path from "path";

// Import validators
import { body, param, validationResult } from "express-validator";

// Import controller functions (business logic)
import {
    createCocktail,
    getAllCocktails,
    getCocktailById,
} from "../controllers/cocktail.controller.js";

// Middleware to protect routes (only logged-in users can create cocktails)
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Validation helper middleware
 * -----------------------------------
 * Same as in auth.routes.js:
 * - Run given validation rules
 * - If errors → return HTTP 400 with { field, msg }
 * - If no errors → continue to controller
 */
const validate = (rules) => [
    ...rules,
    (req, res, next) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            const details = result.array().map((e) => ({
                field: e.param,
                msg: e.msg,
            }));
            return res.status(400).json({ error: "Invalid data", details });
        }
        next();
    },
];

/**
 * Multer configuration
 * -----------------------------------
 * - Storage: saves files to "uploads/" folder with unique filename
 * - fileFilter: only allow PNG, JPG, JPEG, WEBP
 * - limits: max size 2 MB
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, unique);
    },
});

const fileFilter = (req, file, cb) => {
    const ok = ["image/png", "image/jpg", "image/jpeg", "image/webp"].includes(
        file.mimetype
    );
    if (!ok) return cb(new Error("Only PNG/JPG/JPEG/WEBP allowed"));
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

/**
 * POST /api/cocktails
 * -------------------------
 * Protected route → user must be logged in.
 * Accepts form-data with optional "image" file.
 * Validation:
 * - name: required string, trimmed, sanitized
 * - instructions: optional string
 * - alcoholic: optional boolean
 * - ingredients: optional array OR JSON string (controller handles parsing)
 */
router.post(
    "/",
    verifyToken,
    upload.single("image"),
    validate([
        body("name")
            .isString()
            .trim()
            .notEmpty()
            .withMessage("name is required")
            .escape(),
        body("instructions").optional().isString().trim().escape(),
        body("alcoholic")
            .optional()
            .isBoolean()
            .withMessage("alcoholic must be boolean"),
        body("ingredients")
            .optional()
            .custom((val) => {
                if (Array.isArray(val)) return true;
                if (typeof val === "string") return true; // JSON string will be parsed later
                throw new Error("ingredients must be array or JSON string");
            }),
    ]),
    createCocktail
);

/**
 * GET /api/cocktails
 * -------------------------
 * Public route: returns a list of cocktails.
 */
router.get("/", getAllCocktails);

/**
 * GET /api/cocktails/:id
 * -------------------------
 * Public route: get cocktail by ID.
 * Validation:
 * - id must be a valid MongoDB ObjectId
 */
router.get(
    "/:id",
    validate([param("id").isMongoId().withMessage("Invalid id")]),
    getCocktailById
);

export default router;
