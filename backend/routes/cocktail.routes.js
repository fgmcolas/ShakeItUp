import express from 'express';
import multer from 'multer';
import path from 'path';
import { createCocktail, getAllCocktails, getCocktailById } from '../controllers/cocktail.controller.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

router.post('/', upload.single('image'), createCocktail);
router.get('/', getAllCocktails);
router.get('/:id', getCocktailById);

export default router;
