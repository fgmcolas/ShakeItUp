import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        score: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
    },
    { timestamps: true }
);

const cocktailSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        ingredients: [String],
        alcoholic: Boolean,
        officialRecipe: Boolean,
        flavorStyle: String,
        image: String,
        ratings: [ratingSchema],
    },
    { timestamps: true }
);

export default mongoose.model("Cocktail", cocktailSchema);
