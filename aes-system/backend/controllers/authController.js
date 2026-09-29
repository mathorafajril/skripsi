// backend/controllers/authController.js

import bcrypt from "bcrypt";
import jwt    from "jsonwebtoken";
import pool   from "../db/index.js";

const SALT_ROUNDS = 12;

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = (value) => /^\+?\d{10,15}$/.test(value.replace(/\s/g, ""));

// ─── Register ─────────────────────────────────────────────────────────────────
// First registered user becomes admin (auto-approved).
// All subsequent users default to student (pending approval).
// Role is NEVER accepted from the request body.

export const register = async (req, res) => {
  const { name, identifier, password } = req.body;

  try {
    if (!name || !identifier || !password) {
      return res.status(422).json({ message: "All fields are required." });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanName       = name.trim();

    if (!isEmail(cleanIdentifier) && !isPhone(cleanIdentifier)) {
      return res.status(422).json({ message: "Identifier must be a valid email or phone number." });
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(422).json({
        message: "Password must be at least 8 characters with uppercase, lowercase, a number, and a special character.",
      });
    }

    // Check for duplicate identifier
    const existing = await pool.query(
      "SELECT user_id FROM users WHERE identifier = $1",
      [cleanIdentifier]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "An account with this identifier already exists." });
    }

    // First user becomes admin, everyone else is student
    const countResult = await pool.query("SELECT COUNT(*) FROM users");
    const isFirstUser = parseInt(countResult.rows[0].count, 10) === 0;
    const role        = isFirstUser ? "admin" : "student";

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userResult = await pool.query(
      `INSERT INTO users (name, identifier, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, name, identifier, role, created_at`,
      [cleanName, cleanIdentifier, passwordHash, role]
    );

    const newUser = userResult.rows[0];

    // First user (admin) auto-approved, others are pending
    if (isFirstUser) {
      await pool.query(
        `INSERT INTO registrations (user_id, status, reviewed_by, reviewed_at)
         VALUES ($1, 'approved', $1, NOW())`,
        [newUser.user_id]
      );
    } else {
      await pool.query(
        "INSERT INTO registrations (user_id, status) VALUES ($1, 'pending')",
        [newUser.user_id]
      );
    }

    return res.status(201).json({
      message: isFirstUser
        ? "Admin account created successfully. You can now sign in."
        : "Account created successfully. You can now sign in.",
      user: {
        id:         newUser.user_id,
        name:       newUser.name,
        identifier: newUser.identifier,
        role:       newUser.role,
        createdAt:  newUser.created_at,
      },
    });

  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(422).json({ message: "Identifier and password are required." });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const result = await pool.query(
      "SELECT * FROM users WHERE identifier = $1",
      [cleanIdentifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid identifier or password." });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid identifier or password." });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(200).json({
      token,
      user: {
        id:         user.user_id,
        name:       user.name,
        identifier: user.identifier,
        role:       user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (req, res) => {
  try {
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── Assign Role (Admin only) ─────────────────────────────────────────────────
// Only two roles: admin and student. No teacher role.
// Also updates registration status and writes to audit log.

export const assignRole = async (req, res) => {
  const { userId } = req.params;
  const { role }   = req.body;
  const actorId    = req.user.userId;

  try {
    // Only admin and student are valid roles
    const allowedRoles = ["admin", "student"];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(422).json({ message: "Invalid role. Must be admin or student." });
    }

    const current = await pool.query(
      "SELECT role FROM users WHERE user_id = $1",
      [userId]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const oldRole = current.rows[0].role;

    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE user_id = $2
       RETURNING user_id, name, identifier, role`,
      [role, userId]
    );

    // Update registration to approved
    await pool.query(
      `UPDATE registrations
       SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
       WHERE user_id = $2`,
      [actorId, userId]
    );

    // Write to audit log
    await pool.query(
      "SELECT log_role_change($1, $2, $3, $4)",
      [actorId, userId, oldRole, role]
    );

    return res.status(200).json({
      message: `Role updated to '${role}' successfully.`,
      user:    result.rows[0],
    });

  } catch (error) {
    console.error("Assign role error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};