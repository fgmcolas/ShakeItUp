import Cocktail from "../models/cocktail.js";

/**
 * POST /api/cocktails
 * -----------------------------------
 * Creates a new cocktail document.
 * Inputs:
 *  - name: string
 *  - instructions: string
 *  - alcoholic: "true" | "false" (string from form-data)
 *  - ingredients: stringified JSON array in req.body.ingredients
 *  - image: optional file uploaded by multer at req.file
 *
 * Behavior:
 *  - Parses ingredients from string to array
 *  - Builds a public image URL using SERVER_URL (or localhost fallback)
 *  - Saves the cocktail and returns 201 Created
 */
export const createCocktail = async (req, res) => {
    try {
        const { name, instructions, alcoholic } = req.body;

        // Ingredients arrive as a string (because of multipart/form-data).
        // Fallback to empty array if not provided.
        const ingredients = JSON.parse(req.body.ingredients || "[]");

        // Build a public URL for the uploaded image file (multer puts the file at req.file.path)
        // Replace backslashes with forward slashes for Windows compatibility.
        const serverURL =
            process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
        const image = req.file
            ? `${serverURL}/${req.file.path.replace(/\\/g, "/")}`
            : null;

        // Create a new cocktail document
        const newCocktail = new Cocktail({
            name,
            instructions,
            alcoholic: alcoholic === "true", // convert string to boolean
            ingredients,
            image,
        });

        // Persist to MongoDB
        await newCocktail.save();

        // Respond with 201 Created
        return res
            .status(201)
            .json({ message: "Cocktail created", cocktail: newCocktail });
    } catch (err) {
        console.error(err);

        // Handle duplicate key error on unique "name" index
        if (err.code === 11000 && err.keyPattern?.name) {
            return res
                .status(400)
                .json({ message: "This cocktail name is already taken." });
        }

        // Generic server error
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};

/**
 * GET /api/cocktails
 * -----------------------------------
 * Returns all cocktails.
 * For each cocktail, compute:
 *  - averageRating (number with 1 decimal)
 *  - ratingsCount  (number of ratings)
 */
export const getAllCocktails = async (req, res) => {
    try {
        const cocktails = await Cocktail.find();

        // Map result to include rating stats (without changing DB schema)
        const cocktailsWithRatings = cocktails.map((cocktail) => {
            const ratings = cocktail.ratings || [];
            const averageRating = ratings.length
                ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
                : 0;

            return {
                ...cocktail.toObject(),
                averageRating: parseFloat(averageRating.toFixed(1)),
                ratingsCount: ratings.length,
            };
        });

        return res.status(200).json(cocktailsWithRatings);
    } catch (err) {
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};

/**
 * GET /api/cocktails/:id
 * -----------------------------------
 * Returns a single cocktail by id.
 * - Populates ratings.user with 'username'
 * - Adds computed averageRating & ratingsCount
 */
export const getCocktailById = async (req, res) => {
    try {
        const cocktail = await Cocktail.findById(req.params.id).populate(
            "ratings.user",
            "username"
        );

        if (!cocktail) {
            return res.status(404).json({ message: "Cocktail not found" });
        }

        const ratings = cocktail.ratings || [];
        const averageRating = ratings.length
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;

        return res.status(200).json({
            ...cocktail.toObject(),
            averageRating: parseFloat(averageRating.toFixed(1)),
            ratingsCount: ratings.length,
        });
    } catch (err) {
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
};
