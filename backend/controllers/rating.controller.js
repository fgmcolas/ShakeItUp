import Cocktail from '../models/cocktail.js';

export const getRatings = async (req, res) => {
    try {
        const { cocktailId } = req.params;
        const cocktail = await Cocktail.findById(cocktailId).populate('ratings.user', 'username');

        if (!cocktail) return res.status(404).json({ message: 'Cocktail not found.' });

        const ratings = cocktail.ratings;
        const avg = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;

        res.status(200).json({
            average: avg.toFixed(1),
            count: ratings.length,
            reviews: ratings.map((r) => ({
                user: r.user?.username || 'Anonymous',
                score: r.score,
                comment: r.comment,
                createdAt: r.createdAt,
            })),
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const rateCocktail = async (req, res) => {
    try {
        const { cocktailId } = req.params;
        const { score, comment } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const cocktail = await Cocktail.findById(cocktailId);
        if (!cocktail) return res.status(404).json({ message: 'Cocktail not found.' });

        const existingRating = cocktail.ratings.find((r) => r.user.toString() === userId);

        if (existingRating) {
            existingRating.score = score;
            existingRating.comment = comment;
        } else {
            cocktail.ratings.push({ user: userId, score, comment });
        }

        await cocktail.save();
        res.status(200).json({ message: 'Rating saved successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
