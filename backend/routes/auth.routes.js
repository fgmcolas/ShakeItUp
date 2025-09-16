import express from "express";
import { body, validationResult } from "express-validator";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

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
router.post(
    "/register",
    validate([
        body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
        body("username")
            .isString().withMessage("username must be a string")
            .trim()
            .isLength({ min: 3, max: 30 }).withMessage("username must be 3–30 chars"),
        body("password")
            .isString().withMessage("password must be a string")
            .isLength({ min: 8, max: 128 }).withMessage("password must be 8–128 chars"),
    ]),
    register
);

// POST /api/auth/login
router.post(
    "/login",
    validate([
        body("username")
            .isString().withMessage("username must be a string")
            .trim()
            .isLength({ min: 3, max: 30 }).withMessage("username must be 3–30 chars"),
        body("password").isString().notEmpty().withMessage("Password required"),
    ]),
    login
);

export default router;
