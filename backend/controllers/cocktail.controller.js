import fs from "fs/promises";
import path from "path";
import Cocktail from "../models/cocktail.js";

// Parse ingredients from array or JSON string; fall back to []
function parseIngredients(raw) {
    if (Array.isArray(raw)) {
        return raw.filter((x) => typeof x === "string");
    }
    try {
        const parsed = JSON.parse(raw ?? "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

// Create a new cocktail
export const createCocktail = async (req, res) => {
    try {
        const { name, instructions, alcoholic } = req.body;

        const ingredients = parseIngredients(req.body.ingredients);

        // Public URL for uploaded image (if any)
        const serverURL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
        const image = req.file ? `${serverURL}/uploads/${req.file.filename}` : null;

        // Ensure boolean (route should already .toBoolean(); this is defensive)
        const isAlcoholic =
            typeof alcoholic === "boolean" ? alcoholic : String(alcoholic).toLowerCase() === "true";

        const newCocktail = new Cocktail({
            name: name?.trim(),
            instructions: instructions?.trim(),
            alcoholic: isAlcoholic,
            ingredients,
            image,
        });

        await newCocktail.save();

        return res.status(201).json({ message: "Cocktail created", cocktail: newCocktail });
    } catch (err) {
        // Roll back uploaded file if DB save failed
        if (req.file?.path) {
            try {
                await fs.unlink(path.resolve(req.file.path));
            } catch (unlinkErr) {
                console.error("Failed to rollback file:", unlinkErr);
            }
        }

        if (err.code === 11000 && err.keyPattern?.name) {
            return res.status(409).json({ error: "This cocktail name is already taken." });
        }

        console.error("[createCocktail]", err);
        return res.status(500).json({ error: "Server error" });
    }
};

// Get all cocktails with rating stats
export const getAllCocktails = async (req, res) => {
    try {
        const cocktails = await Cocktail.find();

        const result = cocktails.map((c) => {
            const ratings = c.ratings || [];
            const avg = ratings.length
                ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
                : 0;
            return {
                ...c.toObject(),
                averageRating: parseFloat(avg.toFixed(1)),
                ratingsCount: ratings.length,
            };
        });

        return res.status(200).json(result);
    } catch (err) {
        console.error("[getAllCocktails]", err);
        return res.status(500).json({ error: "Server error" });
    }
};

// Get one cocktail by id with rating stats
export const getCocktailById = async (req, res) => {
    try {
        const cocktail = await Cocktail.findById(req.params.id).populate("ratings.user", "username");

        if (!cocktail) {
            return res.status(404).json({ error: "Cocktail not found" });
        }

        const ratings = cocktail.ratings || [];
        const avg = ratings.length
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;

        return res.status(200).json({
            ...cocktail.toObject(),
            averageRating: parseFloat(avg.toFixed(1)),
            ratingsCount: ratings.length,
        });
    } catch (err) {
        console.error("[getCocktailById]", err);
        return res.status(500).json({ error: "Server error" });
    }
};
