import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Normalize email (lowercase + trim)
const normalizeEmail = (email) =>
    typeof email === "string" ? email.trim().toLowerCase() : "";

// Generate JWT for a user id (7 days expiration)
const signJwt = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw Object.assign(new Error("Missing JWT secret"), { statusCode: 500 });
    }
    return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Register a new user
export const register = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        // Normalize
        username = username.trim();
        email = normalizeEmail(email);

        // Check uniqueness (email + username)
        const [existingEmail, existingUsername] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ usernameLower: username.toLowerCase() }),
        ]);

        if (existingEmail) {
            return res.status(409).json({ error: "Email is already registered." });
        }
        if (existingUsername) {
            return res.status(409).json({ error: "Username is already taken." });
        }

        // Hash password (cost = 12 rounds)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        await User.create({
            username,
            usernameLower: username.toLowerCase().trim(),
            email,
            password: hashedPassword,
        });

        return res.status(201).json({ message: "Registration successful." });
    } catch (err) {
        const status = err?.statusCode || 500;
        return res.status(status).json({
            error: status === 500 ? "Server error during registration." : err.message,
        });
    }
};

// Login user with username + password
export const login = async (req, res) => {
    try {
        let { username, password } = req.body;

        username = username.trim();

        // Find user by case-insensitive username
        const user = await User.findOne({
            usernameLower: username.toLowerCase(),
        }).select("+password"); // include password for compare

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const token = signJwt(user._id);

        return res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        const status = err?.statusCode || 500;
        return res.status(status).json({
            error: status === 500 ? "Server error during login." : err.message,
        });
    }
};
