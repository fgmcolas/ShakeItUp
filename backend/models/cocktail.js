import mongoose from 'mongoose';

const cocktailSchema = new mongoose.Schema({
    id: String,
    name: String,
    ingredients: [String],
    instructions: String,
    image: String,
    alcoholType: String,
    flavorStyle: String,
    isAlcoholic: Boolean,
    isOfficial: Boolean
}, { timestamps: true });

const Cocktail = mongoose.model('Cocktail', cocktailSchema);
export default Cocktail;
