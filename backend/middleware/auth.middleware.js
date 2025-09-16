// JWT verification middleware for protected routes
import jwt from "jsonwebtoken";

/**
 * Middleware: verifyToken
 * -----------------------------------
 * Protects private routes by requiring a valid JWT.
 *
 * How it works:
 * 1) Reads the "Authorization" header (expected: "Bearer <token>")
 * 2) Verifies the token with JWT_SECRET (+ optional iss/aud checks)
 * 3) Attaches the decoded payload to req.user
 * 4) Fails with 401 on any problem (missing, malformed, expired, invalid)
 */
export const verifyToken = (req, res, next) => {
    // Normalize header key handling
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (typeof authHeader !== "string") {
        return res.status(401).json({ error: "Access denied: missing token." });
    }

    // Accept only the Bearer scheme (case-insensitive)
    const [scheme, token] = authHeader.split(" ");
    if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
        return res.status(401).json({ error: "Access denied: bad auth scheme." });
    }

    // Fail fast if secret is not configured
    if (!process.env.JWT_SECRET) {
        return res
            .status(500)
            .json({ error: "Server misconfigured: missing JWT secret." });
    }

    try {
        // Optional strict verification (uncomment and set envs if you want)
        // const options = {
        //   issuer: process.env.JWT_ISSUER,
        //   audience: process.env.JWT_AUDIENCE,
        // };
        // const decoded = jwt.verify(token, process.env.JWT_SECRET, options);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded payload for controllers (keep it minimal)
        // Convention: use "sub" for user id
        req.user = decoded;

        return next();
    } catch (err) {
        // Avoid leaking details (expired vs invalid) to keep responses neutral
        return res.status(401).json({ error: "Access denied: invalid token." });
    }
};
