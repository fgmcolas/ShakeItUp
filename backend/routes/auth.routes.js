import express from "express";
import { body, validationResult } from "express-validator";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

// Collects validation errors from express-validator
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

// POST /api/auth/register
// email must be valid; username 3–30 chars; password 8–128 chars
router.post(
    "/register",
    validate([
        body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
        body("username")
            .isString().withMessage("Username must be a string")
            .trim()
            .isLength({ min: 3, max: 30 }).withMessage("Username must be 3–30 chars"),
        body("password")
            .isString().withMessage("Password must be a string")
            .isLength({ min: 8, max: 128 }).withMessage("Password must be 8–128 chars"),
    ]),
    register
);

// POST /api/auth/login
// username 3–30 chars; password required (non-empty)
router.post(
    "/login",
    validate([
        body("username")
            .isString().withMessage("Username must be a string")
            .trim()
            .isLength({ min: 3, max: 30 }).withMessage("Username must be 3–30 chars"),
        body("password").isString().notEmpty().withMessage("Password required"),
    ]),
    login
);

export default router;
