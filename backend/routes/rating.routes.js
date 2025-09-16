import express from "express";
import { param, body, validationResult } from "express-validator";
import { getRatings, rateCocktail } from "../controllers/rating.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

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

// GET /api/ratings/:cocktailId
router.get(
    "/:cocktailId",
    validate([param("cocktailId").isMongoId().withMessage("Invalid cocktail id")]),
    getRatings
);

// POST /api/ratings/:cocktailId
router.post(
    "/:cocktailId",
    verifyToken,
    validate([
        param("cocktailId").isMongoId().withMessage("Invalid cocktail id"),
        body("score").isInt({ min: 1, max: 5 }).withMessage("score must be 1–5"),
        body("comment").optional().isString().trim().isLength({ max: 500 }),
    ]),
    rateCocktail
);

export default router;
