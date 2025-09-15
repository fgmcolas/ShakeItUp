// Import the Cocktail model; ratings are embedded inside Cocktail documents
import Cocktail from "../models/cocktail.js";

/**
 * GET /api/ratings/:cocktailId
 * -----------------------------------
 * Returns rating stats and reviews for a specific cocktail.
 * - Uses populate('ratings.user', 'username') to return the reviewer's username
 * - Computes average score and total count
 * - Formats the response as { average, count, reviews: [...] }
 */
export const getRatings = async (req, res) => {
    try {
        const { cocktailId } = req.params;

        // Load cocktail and populate only the 'username' for rating users
        const cocktail = await Cocktail.findById(cocktailId).populate(
            "ratings.user",
            "username"
        );

        if (!cocktail) {
            // If the cocktail is not found → 404 Not Found
            return res.status(404).json({ message: "Cocktail not found." });
        }

        const ratings = cocktail.ratings || [];

        // Average score (0 if there are no ratings)
        const avg =
            ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
                : 0;

        // Response payload with a light mapping for reviews
        return res.status(200).json({
            // toFixed(1) returns a string like "4.3" — good for display; keep as number if you prefer
            average: avg.toFixed(1),
            count: ratings.length,
            reviews: ratings.map((r) => ({
                user: r.user?.username || "Anonymous",
                score: r.score,
                comment: r.comment,
                createdAt: r.createdAt,
            })),
        });
    } catch (err) {
        // Generic server error
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};

/**
 * POST /api/ratings/:cocktailId
 * -----------------------------------
 * Creates or updates the current user's rating for a cocktail.
 * Behavior:
 * - If the user has already rated → update score/comment
 * - Otherwise → push a new rating entry
 * Requirements:
 * - req.user is set by verifyToken() middleware → contains user id
 */
export const rateCocktail = async (req, res) => {
    try {
        const { cocktailId } = req.params;
        const { score, comment } = req.body;
        const userId = req.user?.id; // added by the auth middleware

        if (!userId) {
            // Should not happen if the route is protected, but keep it defensive
            return res.status(401).json({ message: "User not authenticated." });
        }

        // Find the cocktail to rate
        const cocktail = await Cocktail.findById(cocktailId);
        if (!cocktail) {
            return res.status(404).json({ message: "Cocktail not found." });
        }

        // Look for an existing rating from the same user
        const existingRating = (cocktail.ratings || []).find(
            (r) => r.user.toString() === userId
        );

        if (existingRating) {
            // Update user's previous rating
            existingRating.score = score;
            existingRating.comment = comment;
        } else {
            // Push a brand-new rating entry
            cocktail.ratings.push({ user: userId, score, comment });
        }

        // Persist changes
        await cocktail.save();

        // You return 200 for both create/update.
        // Optional: return 201 when it's a new rating for better semantics.
        return res.status(200).json({ message: "Rating saved successfully." });
    } catch (err) {
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};
