import express from 'express';
import multer from 'multer';
import { createCocktail, getAllCocktails, getCocktailById } from '../controllers/cocktail.controller.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), createCocktail);
router.get('/', getAllCocktails);
router.get('/:id', getCocktailById);

export default router;
