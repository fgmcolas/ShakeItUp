import Cocktail from "../models/cocktail.js";

// GET /api/ratings/:cocktailId
// Returns rating stats and reviews for a cocktail
export const getRatings = async (req, res) => {
    try {
        const { cocktailId } = req.params;
        const cocktail = await Cocktail.findById(cocktailId).populate("ratings.user", "username");

        if (!cocktail) {
            return res.status(404).json({ error: "Cocktail not found" });
        }

        const ratings = cocktail.ratings || [];
        const avg = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length : 0;

        return res.status(200).json({
            average: parseFloat(avg.toFixed(1)), // round to 1 decimal
            count: ratings.length,
            reviews: ratings.map((r) => ({
                user: r.user?.username || "Anonymous",
                score: r.score,
                comment: r.comment,
                createdAt: r.createdAt,
            })),
        });
    } catch (err) {
        console.error("[getRatings]", err);
        return res.status(500).json({ error: "Server error" });
    }
};

// POST /api/ratings/:cocktailId
// Creates or updates the current user's rating
export const rateCocktail = async (req, res) => {
    try {
        const { cocktailId } = req.params;
        const { score, comment } = req.body;
        const userId = req.user?.sub;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated." });
        }

        // Ensure cocktail exists
        const cocktail = await Cocktail.findById(cocktailId);
        if (!cocktail) {
            return res.status(404).json({ error: "Cocktail not found." });
        }

        // Find existing rating for this user
        const existing = (cocktail.ratings || []).find((r) => r.user.toString() === userId);

        if (existing) {
            existing.score = Number(score);
            existing.comment = comment?.trim();
        } else {
            cocktail.ratings.push({ user: userId, score: Number(score), comment: comment?.trim() });
        }

        await cocktail.save();

        return res.status(200).json({ message: "Rating saved successfully." });
    } catch (err) {
        console.error("[rateCocktail]", err);
        return res.status(500).json({ error: "Server error" });
    }
};
