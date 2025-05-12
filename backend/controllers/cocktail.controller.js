import Cocktail from '../models/cocktail.js';

export const createCocktail = async (req, res) => {
    try {
        const { name, instructions, alcoholic } = req.body;
        const ingredients = JSON.parse(req.body.ingredients || '[]');

        const serverURL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
        const image = req.file ? `${serverURL}/${req.file.path.replace(/\\/g, '/')}` : null;
        console.log("SERVER_URL used in upload:", serverURL);

        const newCocktail = new Cocktail({
            name,
            instructions,
            alcoholic: alcoholic === 'true',
            ingredients,
            image,
        });

        await newCocktail.save();

        res.status(201).json({ message: 'Cocktail created', cocktail: newCocktail });
    } catch (err) {
        console.error(err);
        if (err.code === 11000 && err.keyPattern?.name) {
            return res.status(400).json({ message: 'This cocktail name is already taken.' });
        }

        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }

};

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
