import Cocktail from '../models/cocktail.js';
import fs from 'fs';
import path from 'path';

export const getAllCocktails = async (req, res) => {
    try {
        const cocktails = await Cocktail.find();

        const cocktailsWithRatings = cocktails.map(cocktail => {
            const ratings = cocktail.ratings || [];

            const averageRating = ratings.length
                ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
                : 0;

            return {
                ...cocktail.toObject(),
                averageRating: parseFloat(averageRating.toFixed(1)),
                ratingsCount: ratings.length
            };
        });

        res.status(200).json(cocktailsWithRatings);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

export const createCocktail = async (req, res) => {
    try {
        const { name, instructions, alcoholic } = req.body;
        const ingredients = JSON.parse(req.body.ingredients || '[]');

        const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

        const newCocktail = new Cocktail({
            name,
            instructions,
            alcoholic: alcoholic === 'true',
            ingredients,
            image: imagePath,
            officialRecipe: false,
            flavorStyle: 'Custom',
        });

        await newCocktail.save();
        res.status(201).json(newCocktail);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur lors de la création', error: err.message });
    }
};
