import Cocktail from '../models/cocktail.js';

export const getAllCocktails = async (req, res) => {
    try {
        const cocktails = await Cocktail.find();

        const cocktailsWithRatings = cocktails.map((cocktail) => {
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

export const getCocktailById = async (req, res) => {
    try {
        const cocktail = await Cocktail.findById(req.params.id).populate('ratings.user', 'username');
        if (!cocktail) {
            return res.status(404).json({ message: 'Cocktail not found' });
        }

        const ratings = cocktail.ratings || [];

        const averageRating = ratings.length
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;

        res.status(200).json({
            ...cocktail.toObject(),
            averageRating: parseFloat(averageRating.toFixed(1)),
            ratingsCount: ratings.length
        });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};
