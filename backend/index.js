import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import cocktailRoutes from "./routes/cocktail.routes.js";
import userRoutes from "./routes/user.routes.js";
import ratingRoutes from "./routes/rating.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}

app.use(cors({
    origin: true,
    credentials: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/cocktails", cocktailRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ratings", ratingRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Backend is running on port ${PORT}`);
        });
    })
    .catch((err) => console.error("MongoDB connection error:", err));
