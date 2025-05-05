import express from "express";
import { getRatings, rateCocktail } from "../controllers/rating.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:cocktailId", getRatings);
router.post("/:cocktailId", verifyToken, rateCocktail);

export default router;
