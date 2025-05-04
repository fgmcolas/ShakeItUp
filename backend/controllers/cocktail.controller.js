import Cocktail from '../models/cocktail.js';

export const getAllCocktails = async (req, res) => {
    try {
        const cocktails = await Cocktail.find();
        res.status(200).json(cocktails);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};
