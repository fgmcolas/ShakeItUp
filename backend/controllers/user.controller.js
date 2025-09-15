// Import the User model
import User from "../models/user.js";

/**
 * GET /api/users/:id
 * -----------------------------------
 * Returns a user's profile by id.
 * - Excludes the password field
 * - Populates 'favorites' to return full cocktail docs (can be heavy → optional)
 */
export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id)
            .select("-password") // never return password hashes
            .populate("favorites"); // returns full cocktail docs; remove if you want only ids

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json(user);
    } catch (err) {
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};

/**
 * PATCH /api/users/:id/favorites
 * -----------------------------------
 * Toggles a cocktail id in the user's favorites array.
 * Behavior:
 * - If cocktailId is not in favorites → push it
 * - If cocktailId already exists → remove it
 * Notes:
 * - The route is protected via JWT middleware (verifyToken)
 * - Basic body validation is done in the route with express-validator
 */
export const updateFavorites = async (req, res) => {
    const { id } = req.params;

    // Quick defensive check: ensure body is an object
    if (!req.body || typeof req.body !== "object") {
        return res
            .status(400)
            .json({ message: "Missing or invalid request body." });
    }

    const { cocktailId } = req.body;

    if (!cocktailId) {
        // Route-level validator already checks this, but keep a clean message here
        return res.status(400).json({ message: "cocktailId is required." });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Toggle logic: add if not present, remove if already present
        const idx = user.favorites.findIndex((fav) => fav.toString() === cocktailId);

        if (idx === -1) {
            user.favorites.push(cocktailId);
        } else {
            user.favorites.splice(idx, 1);
        }

        await user.save();

        // Return back the updated favorites array
        return res.status(200).json({ favorites: user.favorites });
    } catch (err) {
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};

/**
 * PATCH /api/users/:id/ingredients
 * -----------------------------------
 * Replaces the user's ingredients array with the one provided.
 * Notes:
 * - The route is protected via JWT middleware
 * - Route-level validation ensures 'ingredients' is an array of strings
 */
export const updateIngredients = async (req, res) => {
    const { id } = req.params;
    const { ingredients } = req.body;

    try {
        // Find the user and update the 'ingredients' field
        const user = await User.findByIdAndUpdate(
            id,
            { ingredients }, // sets the new array as-is
            { new: true }    // return the updated document
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({ ingredients: user.ingredients });
    } catch (err) {
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};
