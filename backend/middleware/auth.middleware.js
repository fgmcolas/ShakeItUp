// Import JWT library to verify JSON Web Tokens
import jwt from "jsonwebtoken";

/**
 * Middleware: verifyToken
 * -----------------------------------
 * Protects private routes by requiring a valid JWT.
 *
 * How it works:
 * 1. Looks for the "Authorization" header in the request
 *    - Expected format: "Bearer <token>"
 * 2. If no header or wrong format → return 401 (unauthorized)
 * 3. If header is valid → extract token and verify with JWT_SECRET
 * 4. If token is valid → attach decoded payload to req.user
 * 5. If token is invalid/expired → return 401 (unauthorized)
 */
export const verifyToken = (req, res, next) => {
    // Get the Authorization header
    const authHeader = req.headers.authorization;

    // If header missing or doesn't start with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    }

    // Extract token part after "Bearer "
    const token = authHeader.split(" ")[1];

    try {
        // Verify the token using the secret key from .env
        // - If valid → decoded payload is returned
        // - Payload usually contains: { id, role, iat, exp }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded payload to the request for controllers to use
        req.user = decoded;

        // Continue to the next middleware/controller
        next();
    } catch (err) {
        // If verification fails (expired, malformed, wrong secret)
        return res.status(401).json({ message: "Invalid token." });
    }
};
