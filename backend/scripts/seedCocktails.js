import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Cocktail from "../models/cocktail.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const dataPath = path.join(__dirname, "../data/cocktails.json");
        const raw = fs.readFileSync(dataPath, "utf8");
        const cocktails = JSON.parse(raw);

        if (!Array.isArray(cocktails)) {
            throw new Error("cocktails.json must export an array");
        }

        const doReset = String(process.env.RESET || "").toLowerCase() === "true";

        if (doReset) {
            console.warn("RESET=true → Deleting all cocktails before seeding...");
            await Cocktail.deleteMany({});
        }

        let inserted = 0;
        for (const c of cocktails) {
            // Upsert by unique name
            const res = await Cocktail.updateOne(
                { name: c.name },
                { $setOnInsert: c },
                { upsert: true }
            );
            // Count inserts (not updates)
            if (res.upsertedCount === 1 || res.upsertedId) inserted++;
        }

        console.log(`Seeding done. Inserted: ${inserted}, Upserts attempted: ${cocktails.length}`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err);
        process.exit(1);
    }
})();
