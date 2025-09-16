import mongoose from "mongoose";
import User from "../models/user.js";

/**
 * Helper: ensure the authenticated user matches the target :id
 * - Deny with 403 if not the same user (no admin support here yet)
 */
function assertSelfOrForbidden(req, res) {
    const requesterId = req.user?.sub || req.user?.id;
    const targetId = req.params.id;
    if (!requesterId || String(requesterId) !== String(targetId)) {
        res.status(403).json({ error: "Forbidden: you can access only your own profile." });
        return false;
    }
    return true;
}

/**
 * Helper: validate an array of Mongo ObjectIds (strings)
 * - Returns { ok: true, values: ObjectId[] } OR { ok: false, error }
 */
function validateObjectIdArray(input) {
    if (!Array.isArray(input)) {
        return { ok: false, error: "Expected an array of ids." };
    }
    const unique = new Set();
    const values = [];
    for (const v of input) {
        if (typeof v !== "string" || !mongoose.Types.ObjectId.isValid(v)) {
            return { ok: false, error: "Array must contain valid MongoDB ObjectIds." };
        }
        if (!unique.has(v)) {
            unique.add(v);
            values.push(new mongoose.Types.ObjectId(v));
        }
    }
    return { ok: true, values };
}

/**
 * Helper: sanitize a string array
 * - trims, filters empties, enforces max length, deduplicates
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
 * -----------------------------------
 * Returns a user's profile by id.
 * Security:
 * - Protected route: user can only read their own profile.
 * - Excludes sensitive fields (password, internal fields).
 * - Optional query ?populate=favorites to populate cocktail docs.
 */
export const getUserById = async (req, res) => {
    try {
        if (!assertSelfOrForbidden(req, res)) return;

        const { id } = req.params;
        const doPopulate = String(req.query.populate || "").toLowerCase() === "favorites";

        let query = User.findById(id)
            .select("-password -usernameLower -__v"); // never expose password or internal fields

        if (doPopulate) {
            // Populating favorites can be heavy; only do it if explicitly requested
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
 * PATCH /api/users/:id/favorites
 * -----------------------------------
 * Replaces the user's favorites with the provided array of cocktail ids.
 * Input (body): { favorites: string[] }  // Mongo ObjectId strings
 * Security:
 * - Protected route: user can only update their own profile.
 * - Validates that all ids are valid Mongo ObjectIds.
 * - Deduplicates ids server-side.
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

        // Return ids only (avoid heavy payloads by default)
        return res.status(200).json({ favorites: user.favorites });
    } catch (err) {
        console.error("[updateFavorites]", err);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * PATCH /api/users/:id/ingredients
 * -----------------------------------
 * Replaces the user's ingredients with the provided array of strings.
 * Input (body): { ingredients: string[] }
 * Security:
 * - Protected route: user can only update their own profile.
 * - Sanitizes strings (trim, max length 64, dedupe). Empty strings removed.
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
