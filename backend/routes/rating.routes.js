// Import express to create a router
import express from "express";

// Import validators:
// - param: to validate URL parameters
// - body: to validate request body fields
// - validationResult: to collect validation errors
import { param, body, validationResult } from "express-validator";

// Import controller functions (business logic)
import { getRatings, rateCocktail } from "../controllers/rating.controller.js";

// Import auth middleware to protect write endpoints
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Validation helper middleware
 * -----------------------------------
 * Runs a list of validation rules, then checks for errors.
 * If any error exists → return HTTP 400 with { field, msg } per error.
 * Otherwise → continue to the controller.
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
 * GET /api/ratings/:cocktailId
 * -----------------------------------
 * Public route: fetch all ratings for a given cocktail.
 * Validation:
 * - cocktailId: must be a valid MongoDB ObjectId
 *
 * Controller responsibility:
 * - Return 200 with array of ratings (can be empty).
 * - Return 404 if cocktail doesn't exist (up to your controller’s logic).
 */
router.get(
    "/:cocktailId",
    validate([param("cocktailId").isMongoId().withMessage("Invalid cocktail id")]),
    getRatings
);

/**
 * POST /api/ratings/:cocktailId
 * -----------------------------------
 * Protected route: user must be authenticated.
 * The user rates (or updates their rating for) a cocktail.
 * Validation:
 * - cocktailId: must be a valid MongoDB ObjectId
 * - score: integer between 1 and 5 (inclusive)
 * - comment: optional string, trimmed, escaped (basic XSS prevention)
 *
 * Controller responsibility:
 * - Create or update the user's rating for this cocktail.
 * - Return 201 if newly created, 200 if updated (your choice).
 * - Return 404 if cocktail doesn't exist.
 */
router.post(
    "/:cocktailId",
    verifyToken,
    validate([
        param("cocktailId").isMongoId().withMessage("Invalid cocktail id"),
        body("score")
            .isInt({ min: 1, max: 5 })
            .withMessage("score must be an integer between 1 and 5"),
        body("comment").optional().isString().trim().escape(),
    ]),
    rateCocktail
);

export default router;
