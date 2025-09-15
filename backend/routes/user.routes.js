// Import express to create a router
import express from "express";

// Import validators:
// - param: to validate URL params (e.g., user id)
// - body: to validate request body fields
// - validationResult: to check for validation errors
import { param, body, validationResult } from "express-validator";

// Import controller functions (business logic)
import {
    getUserById,
    updateFavorites,
    updateIngredients,
} from "../controllers/user.controller.js";

// Import middleware to protect private routes
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Validation helper middleware
 * -----------------------------------
 * Collects errors from express-validator.
 * - If any errors → return HTTP 400 with details.
 * - Otherwise → continue to controller.
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
 * Protected route: fetch user profile by id.
 * Validation:
 * - id must be a valid MongoDB ObjectId
 *
 * Controller responsibility:
 * - Return 200 with user data (excluding sensitive info).
 * - Return 404 if user not found.
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
 * Protected route: update a user's list of favorite cocktails.
 * Validation:
 * - id: must be valid MongoDB ObjectId
 * - favorites: must be an array of MongoDB ObjectIds (cocktail ids)
 *
 * Controller responsibility:
 * - Update the user document with new favorites.
 * - Return 200 with updated user data.
 */
router.patch(
    "/:id/favorites",
    verifyToken,
    validate([
        param("id").isMongoId().withMessage("Invalid user id"),
        body("favorites")
            .isArray()
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
 * Protected route: update the user's list of available ingredients.
 * Validation:
 * - id: must be valid MongoDB ObjectId
 * - ingredients: must be an array of strings
 * - each string is sanitized (trim + escape)
 *
 * Controller responsibility:
 * - Update the user document with new ingredients.
 * - Return 200 with updated user data.
 */
router.patch(
    "/:id/ingredients",
    verifyToken,
    validate([
        param("id").isMongoId().withMessage("Invalid user id"),
        body("ingredients")
            .isArray()
            .withMessage("ingredients must be an array"),
        body("ingredients.*")
            .isString()
            .trim()
            .escape(),
    ]),
    updateIngredients
);

export default router;
