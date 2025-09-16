import express from "express";
import { param, body, validationResult } from "express-validator";
import {
    getUserById,
    updateFavorites,
    updateIngredients,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Validation helper
 * - Collects express-validator errors and returns 400 if any
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
 * GET /api/users/:id
 * -----------------------------------
 * Protected route to fetch user profile (excluding sensitive info).
 */
router.get(
    "/:id",
    verifyToken,
    validate([param("id").isMongoId().withMessage("Invalid user id")]),
    getUserById
);

/**
 * PATCH /api/users/:id/favorites
 * -----------------------------------
 * Updates a user's favorites list.
 */
router.patch(
    "/:id/favorites",
    verifyToken,
    validate([
        param("id").isMongoId().withMessage("Invalid user id"),
        body("favorites")
            .isArray({ min: 0 })
            .withMessage("favorites must be an array"),
        body("favorites.*")
            .isMongoId()
            .withMessage("favorites must contain valid cocktail ids"),
    ]),
    updateFavorites
);

/**
 * PATCH /api/users/:id/ingredients
 * -----------------------------------
 * Updates a user's ingredients list.
 */
router.patch(
    "/:id/ingredients",
    verifyToken,
    validate([
        param("id").isMongoId().withMessage("Invalid user id"),
        body("ingredients")
            .isArray({ min: 0 })
            .withMessage("ingredients must be an array"),
        body("ingredients.*")
            .isString()
            .trim()
            .isLength({ max: 64 })
            .withMessage("Each ingredient must be a string ≤64 chars"),
    ]),
    updateIngredients
);

export default router;
