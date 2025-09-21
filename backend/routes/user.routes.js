import express from "express";
import { param, body, validationResult } from "express-validator";
import { getUserById, updateFavorites, updateIngredients, toggleFavorite } from "../controllers/user.controller.js";
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

// GET /api/users/:id
router.get(
    "/:id",
    verifyToken,
    validate([param("id").isMongoId().withMessage("Invalid user id")]),
    getUserById
);

// PATCH /api/users/:id/favorites/full (replace all)
router.patch(
    "/:id/favorites/full",
    verifyToken,
    validate([
        param("id").isMongoId().withMessage("Invalid user id"),
        body("favorites").isArray({ min: 0 }).withMessage("favorites must be an array"),
        body("favorites.*").isMongoId().withMessage("favorites must contain valid cocktail ids"),
    ]),
    updateFavorites
);

// PATCH /api/users/:id/favorites (toggle one)
// Body: { cocktailId: string, action?: 'add' | 'remove' }
router.patch(
    "/:id/favorites",
    verifyToken,
    validate([
        param("id").isMongoId().withMessage("Invalid user id"),
        body("cocktailId").isMongoId().withMessage("cocktailId must be a valid Mongo id"),
        body("action").optional().isIn(["add", "remove"]).withMessage("action must be 'add' or 'remove'"),
    ]),
    toggleFavorite
);

// PATCH /api/users/:id/ingredients
router.patch(
    "/:id/ingredients",
    verifyToken,
    validate([
        param("id").isMongoId().withMessage("Invalid user id"),
        body("ingredients").isArray({ min: 0 }).withMessage("ingredients must be an array"),
        body("ingredients.*").isString().trim().isLength({ max: 64 }).withMessage("Each ingredient must be a string ≤64 chars"),
    ]),
    updateIngredients
);

export default router;
