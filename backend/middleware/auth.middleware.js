import jwt from "jsonwebtoken";

// Middleware to protect routes with JWT
export const verifyToken = (req, res, next) => {
    // Read the Authorization header (expected format: "Bearer <token>")
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (typeof authHeader !== "string") {
        return res.status(401).json({ error: "Access denied: missing token." });
    }

    // Must use the Bearer scheme (case-insensitive)
    const [scheme, token] = authHeader.split(" ");
    if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
        return res.status(401).json({ error: "Access denied: bad auth scheme." });
    }

    // Fail fast if JWT secret is missing
    if (!process.env.JWT_SECRET) {
        return res
            .status(500)
            .json({ error: "Server misconfigured: missing JWT secret." });
    }

    try {
        // Verify token (with optional issuer/audience if configured)
        // const options = { issuer: process.env.JWT_ISSUER, audience: process.env.JWT_AUDIENCE };
        // const decoded = jwt.verify(token, process.env.JWT_SECRET, options);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded payload to req.user (convention: sub = user id)
        req.user = decoded;

        return next();
    } catch (err) {
        // Always return neutral error (avoid leaking expired vs invalid)
        return res.status(401).json({ error: "Access denied: invalid token." });
    }
};
