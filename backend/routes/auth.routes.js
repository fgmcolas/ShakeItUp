// Import express to create a router
import express from "express";

// Import validators from express-validator
// - body: to validate request body fields
// - validationResult: to collect validation errors
import { body, validationResult } from "express-validator";

// Import controller functions (business logic)
// - register: create a new user
// - login: authenticate a user
import { register, login } from "../controllers/auth.controller.js";

// Create an Express router (will be mounted in index.js under /api/auth)
const router = express.Router();

/**
 * Validation middleware helper
 * -----------------------------------
 * Takes a list of validation "rules" (from express-validator).
 * After running the rules, it checks if any validation errors exist.
 * - If errors are found → return HTTP 400 with details { field, msg }.
 * - If no errors → call next() and continue to controller.
 */
const validate = (rules) => [
    ...rules, // spread the validation rules into middleware
    (req, res, next) => {
        const result = validationResult(req); // collect validation errors
        if (!result.isEmpty()) {
            // Format errors: keep only { field, msg }
            const details = result.array().map((e) => ({
                field: e.param,
                msg: e.msg,
            }));
            // Return HTTP 400 with details
            return res.status(400).json({ error: "Invalid data", details });
        }
        // No errors → continue to the next middleware/controller
        next();
    },
];

/**
 * POST /api/auth/register
 * --------------------------
 * Public route: creates a new user account.
 * Validation rules:
 * - email: must be valid format, normalized (lowercase, trimmed)
 * - username: string, trimmed, 3–30 chars, escaped (basic XSS mitigation)
 * - password: string, at least 8 chars
 *
 * If validation passes → goes to register() controller.
 */
router.post(
    "/register",
    validate([
        body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
        body("username")
            .isString()
            .withMessage("username must be a string")
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage("username must be 3–30 chars")
            .escape(),
        body("password")
            .isString()
            .withMessage("password must be a string")
            .isLength({ min: 8 })
            .withMessage("password must be at least 8 chars"),
    ]),
    register
);

/**
 * POST /api/auth/login
 * -------------------------
 * Public route: logs in a user.
 * Validation rules (UPDATED to match controller):
 * - username: string, trimmed, 3–30 chars
 * - password: cannot be empty
 *
 * If validation passes → goes to login() controller.
 */
router.post(
    "/login",
    validate([
        body("username")
            .isString()
            .withMessage("username must be a string")
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage("username must be 3–30 chars"),
        body("password").notEmpty().withMessage("Password required"),
    ]),
    login
);

// Export router so it can be mounted in index.js
export default router;
