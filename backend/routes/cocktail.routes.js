import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cocktailsFile = path.join(__dirname, "../data/cocktails.json");

router.get("/", (req, res) => {
    fs.readFile(cocktailsFile, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading cocktails.json:", err);
            return res.status(500).json({ message: "Error reading cocktail data." });
        }

        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            res.status(500).json({ message: "Invalid JSON format." });
        }
    });
});

export default router;
