// backend/routes/authRoutes.js

import express                                        from "express";
import { register, login, logout, assignRole }        from "../controllers/authController.js";
import { requireAuth, requireRole }                   from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login",    login);

// Protected — requires valid JWT
router.post("/logout", requireAuth, logout);

// Admin only — assign a role to a user
// Only admins can change any user's role (including promoting to teacher or admin)
router.patch("/users/:userId/role", requireAuth, requireRole("admin"), assignRole);

export default router;
