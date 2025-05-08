import express from "express";
import multer from "multer";
import { getAllCocktails, createCocktail } from "../controllers/cocktail.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueSuffix);
    },
});
const upload = multer({ storage });

router.get("/", getAllCocktails);
router.post("/", upload.single("image"), createCocktail);

export default router;
