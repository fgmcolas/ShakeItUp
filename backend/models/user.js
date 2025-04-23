import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cocktail" }],
        ingredients: [String],
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
