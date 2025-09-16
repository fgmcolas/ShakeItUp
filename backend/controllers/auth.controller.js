import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * Helper: normalize email (lowercase + trim)
 */
const normalizeEmail = (email) =>
    typeof email === "string" ? email.trim().toLowerCase() : "";

/**
 * Helper: generate signed JWT for a user id
 * - Minimal payload: { sub }
 * - 7 days expiration by default
 */
const signJwt = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw Object.assign(new Error("Missing JWT secret"), { statusCode: 500 });
    }
    return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
        expiresIn: "7d",
        // issuer: process.env.JWT_ISSUER,
        // audience: process.env.JWT_AUDIENCE,
    });
};

/**
 * POST /api/auth/register
 * -----------------------------------
 * Registers a new user.
 */
export const register = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        // Basic server-side validation (routes also validate)
        if (
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({ error: "Invalid payload." });
        }

        username = username.trim();
        email = normalizeEmail(email);

        if (username.length < 3 || username.length > 30) {
            return res
                .status(400)
                .json({ error: "Username must be 3–30 characters long." });
        }
        if (password.length < 8 || password.length > 128) {
            return res
                .status(400)
                .json({ error: "Password must be 8–128 characters long." });
        }

        // Uniqueness checks (email + username)
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

        // Hash password with strong cost factor
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user (password is stored with select:false on the model)
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

/**
 * POST /api/auth/login
 * -----------------------------------
 * Logs a user in via username + password.
 */
export const login = async (req, res) => {
    try {
        let { username, password } = req.body;

        if (typeof username !== "string" || typeof password !== "string") {
            return res.status(400).json({ error: "Invalid payload." });
        }

        username = username.trim();
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required." });
        }

        // Find by case-insensitive username via stored usernameLower
        const user = await User.findOne({
            usernameLower: username.toLowerCase(),
        }).select("+password"); // include password for compare

        // Neutral message to avoid username enumeration
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
