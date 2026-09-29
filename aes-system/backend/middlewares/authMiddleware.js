// backend/middleware/authMiddleware.js
// Protects routes that require a valid JWT.
// Attach this middleware to any route that needs authentication.

import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided. Access denied." });
    }

    const token = authHeader.split(" ")[1];

    // Verify and decode — throws if expired or tampered
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to request so downstream handlers can use it
    req.user = decoded; // { userId, role, iat, exp }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token. Access denied." });
  }
};

// Role-based access control middleware
// Usage: router.get('/admin', requireAuth, requireRole('admin'), handler)
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to access this resource." });
  }
  next();
};
