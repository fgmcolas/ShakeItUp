import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        score: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true, maxlength: 500 },
    },
    { _id: false, timestamps: true }
);

const CocktailSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // keep unique index on field
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        instructions: { type: String, trim: true, maxlength: 4000 },
        ingredients: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => arr.every((s) => typeof s === "string" && s.trim().length <= 64),
                message: "Each ingredient must be a string ≤ 64 characters.",
            },
        },
        alcoholic: { type: Boolean, default: false },
        officialRecipe: { type: Boolean, default: false },
        flavorStyle: { type: String, trim: true, maxlength: 64 },
        image: {
            type: String,
            trim: true,
            maxlength: 512,
            match: /^https?:\/\/.+/i, // lightweight URL check
        },
        ratings: { type: [RatingSchema], default: [] },
    },
    { timestamps: true }
);

// Note: No extra index for name; field-level unique is enough.
export default mongoose.model("Cocktail", CocktailSchema);
