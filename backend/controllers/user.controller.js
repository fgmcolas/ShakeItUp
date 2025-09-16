import mongoose from "mongoose";
import User from "../models/user.js";

/**
 * Ensure the authenticated user matches the target :id
 */
function assertSelfOrForbidden(req, res) {
    const requesterId = req.user?.sub || req.user?.id;
    const targetId = req.params.id;
    if (!requesterId || String(requesterId) !== String(targetId)) {
        res.status(403).json({
            error: "Forbidden: you can access only your own profile.",
        });
        return false;
    }
    return true;
}

/**
 * Validate an array of Mongo ObjectIds
 */
function validateObjectIdArray(input) {
    if (!Array.isArray(input)) {
        return { ok: false, error: "Expected an array of ids." };
    }
    const unique = new Set();
    const values = [];
    for (const v of input) {
        if (typeof v !== "string" || !mongoose.Types.ObjectId.isValid(v)) {
            return {
                ok: false,
                error: "Array must contain valid MongoDB ObjectIds.",
            };
        }
        if (!unique.has(v)) {
            unique.add(v);
            values.push(new mongoose.Types.ObjectId(v));
        }
    }
    return { ok: true, values };
}

/**
 * Sanitize a string array
 */
function sanitizeStringArray(arr, maxLen = 64) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    const seen = new Set();
    for (const s of arr) {
        if (typeof s !== "string") continue;
        const val = s.trim();
        if (!val) continue;
        if (val.length > maxLen) continue;
        if (!seen.has(val)) {
            seen.add(val);
            out.push(val);
        }
    }
    return out;
}

/**
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
    try {
        if (!assertSelfOrForbidden(req, res)) return;

        const { id } = req.params;
        const doPopulate =
            String(req.query.populate || "").toLowerCase() === "favorites";

        let query = User.findById(id).select("-password -usernameLower -__v");
        if (doPopulate) {
            query = query.populate("favorites");
        }

        const user = await query.exec();
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json(user);
    } catch (err) {
        console.error("[getUserById]", err);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * PATCH /api/users/:id/favorites/full
 * Replace all favorites with provided array
 */
export const updateFavorites = async (req, res) => {
    try {
        if (!assertSelfOrForbidden(req, res)) return;

        const { id } = req.params;
        const { favorites } = req.body;

        const checked = validateObjectIdArray(favorites);
        if (!checked.ok) {
            return res.status(400).json({ error: checked.error });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { favorites: checked.values },
            { new: true, runValidators: true }
        ).select("-password -usernameLower -__v");

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({ favorites: user.favorites });
    } catch (err) {
        console.error("[updateFavorites]", err);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * PATCH /api/users/:id/favorites
 * Toggle one favorite (add/remove).
 * If "action" is missing, infer it based on whether the cocktail is already in favorites.
 */
export const toggleFavorite = async (req, res) => {
    try {
        if (!assertSelfOrForbidden(req, res)) return;

        const { id } = req.params;
        const { cocktailId, action } = req.body;

        if (!cocktailId || !mongoose.Types.ObjectId.isValid(cocktailId)) {
            return res.status(400).json({ error: "Invalid cocktailId" });
        }

        const oid = new mongoose.Types.ObjectId(cocktailId);

        // Fetch user to determine toggle if no action provided
        const user = await User.findById(id).select("favorites");
        if (!user) return res.status(404).json({ error: "User not found." });

        let finalAction = action;
        if (!finalAction) {
            const alreadyFavorite = user.favorites.some(
                (f) => f.toString() === cocktailId
            );
            finalAction = alreadyFavorite ? "remove" : "add";
        }

        const update =
            finalAction === "add"
                ? { $addToSet: { favorites: oid } }
                : { $pull: { favorites: oid } };

        const updated = await User.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true,
        }).select("-password -usernameLower -__v");

        return res.status(200).json({
            favorites: updated.favorites.map((f) => String(f)),
        });
    } catch (err) {
        console.error("[toggleFavorite]", err);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * PATCH /api/users/:id/ingredients
 */
export const updateIngredients = async (req, res) => {
    try {
        if (!assertSelfOrForbidden(req, res)) return;

        const { id } = req.params;
        const sanitized = sanitizeStringArray(req.body?.ingredients, 64);

        const user = await User.findByIdAndUpdate(
            id,
            { ingredients: sanitized },
            { new: true, runValidators: true }
        ).select("-password -usernameLower -__v");

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({ ingredients: user.ingredients });
    } catch (err) {
        console.error("[updateIngredients]", err);
        return res.status(500).json({ error: "Server error" });
    }
};
