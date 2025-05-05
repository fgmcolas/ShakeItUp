import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

import authRoutes from "./routes/auth.routes.js";
import cocktailRoutes from "./routes/cocktail.routes.js";
import userRoutes from "./routes/user.routes.js";
import ratingRoutes from "./routes/rating.routes.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/cocktails", cocktailRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ratings", ratingRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Backend is running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => console.error("MongoDB connection error:", err));
