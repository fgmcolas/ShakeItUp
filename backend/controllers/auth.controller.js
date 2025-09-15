import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * POST /api/auth/register
 * -----------------------------------
 * Registers a new user.
 * Inputs:
 *  - username, email, password
 *
 * Steps:
 *  1. Check uniqueness for email and username
 *  2. Hash the password with bcrypt
 *  3. Create the user document
 *  4. Return 201 Created
 *
 * Note:
 *  - You currently don't return a token on registration (only on login).
 *    That's fine; some APIs issue token at signup, others require explicit login.
 */
export const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if email is already used
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        // Check if username is already taken
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username is already taken." });
        }

        // Hash password (salt rounds = 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user document
        await User.create({
            username,
            email,
            password: hashedPassword,
        });

        // Return 201 Created (you could also return the created user if needed)
        return res.status(201).json({ message: "Registration successful." });
    } catch (err) {
        return res.status(500).json({
            message: "Server error during registration.",
            error: err.message,
        });
    }
};

/**
 * POST /api/auth/login
 * -----------------------------------
 * Logs a user in via username + password.
 * Steps:
 *  1. Find user by username
 *  2. Compare plaintext password with hashed password using bcrypt.compare
 *  3. If valid → issue JWT token (7 days expiry) and return minimal user info
 *  4. If invalid → return appropriate 4xx
 *
 * Security tips:
 *  - It's a good practice to use a neutral error message ("Invalid credentials")
 *    so attackers can't enumerate valid usernames; your current implementation
 *    returns 404 if user not found and 401 if incorrect password, which is fine
 *    for dev but less stealthy in production. Your call.
 */
export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            // Optional (production): return 401 with a neutral message
            return res.status(404).json({ message: "User not found." });
        }

        // Compare password with stored hash
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            // Optional (production): return 401 with "Invalid credentials"
            return res.status(401).json({ message: "Incorrect password." });
        }

        // Issue a signed JWT (contains user id only here)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // Return token + minimal user payload for the frontend
        return res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        return res.status(500).json({
            message: "Server error during login.",
            error: err.message,
        });
    }
};
