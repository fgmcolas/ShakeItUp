import express from "express";
import { getAllCocktails, getCocktailById } from "../controllers/cocktail.controller.js";

const router = express.Router();

router.get("/", getAllCocktails);
router.get("/:id", getCocktailById);

export default router;
