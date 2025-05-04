import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Cocktail from '../models/cocktail.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");

        const rawData = fs.readFileSync(path.join(__dirname, '../data/cocktails.json'));
        const cocktails = JSON.parse(rawData);

        await Cocktail.deleteMany();
        await Cocktail.insertMany(cocktails);

        console.log("Cocktails imported!");
        process.exit();
    })
    .catch(err => console.error("MongoDB Error:", err));
