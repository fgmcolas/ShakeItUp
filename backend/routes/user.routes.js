import express from "express";
import {
    getUserById,
    updateFavorites,
    updateIngredients,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("API users OK");
});

router.get("/:id", verifyToken, getUserById);
router.patch("/:id/favorites", verifyToken, updateFavorites);
router.patch("/:id/ingredients", verifyToken, updateIngredients);

export default router;
