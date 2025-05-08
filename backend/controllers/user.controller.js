import User from "../models/user.js";

export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id)
            .select("-password")
            .populate("favorites");

        if (!user) return res.status(404).json({ message: "User not found." });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const updateFavorites = async (req, res) => {
    const { id } = req.params;
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: "Missing or invalid request body." });
    }

    const { cocktailId } = req.body;

    if (!cocktailId) {
        return res.status(400).json({ message: "cocktailId is required." });
    }

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found." });

        const index = user.favorites.findIndex(
            (fav) => fav.toString() === cocktailId
        );

        if (index === -1) {
            user.favorites.push(cocktailId);
        } else {
            user.favorites.splice(index, 1);
        }

        await user.save();
        res.status(200).json({ favorites: user.favorites });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const updateIngredients = async (req, res) => {
    const { id } = req.params;
    const { ingredients } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { ingredients },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found." });

        res.status(200).json({ ingredients: user.ingredients });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
