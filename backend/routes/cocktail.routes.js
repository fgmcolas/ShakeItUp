import express from "express";
import { getAllCocktails } from "../controllers/cocktail.controller.js";

const router = express.Router();

router.get("/", getAllCocktails);

export default router;
