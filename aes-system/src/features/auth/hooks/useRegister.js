// src/features/auth/hooks/useRegister.js
// Encapsulates all register form state, client-side validation, and submission.
// Role is NOT accepted from the user — it defaults to 'student' server-side.
// Only an admin can assign a different role after the account is created.

import { useState } from "react";
import { authService } from "../services/authService";

// Validates an email address format
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Validates a phone number (10–15 digits, optional leading +)
const isValidPhone = (value) => /^\+?\d{10,15}$/.test(value);

// Password must be at least 8 chars, include uppercase, lowercase, digit, special char
const isStrongPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(value);

export function useRegister() {
  const [name, setName]                       = useState("");
  const [identifier, setIdentifier]           = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass]               = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [toast, setToast]                     = useState(null); // { type: 'error'|'success', msg: '' }

  // ── Client-side validation ──────────────────────────────────────────────────
  const validate = () => {
    if (!name.trim()) {
      return "Full name is required.";
    }
    if (!identifier.trim()) {
      return "Email or phone number is required.";
    }
    if (!isValidEmail(identifier) && !isValidPhone(identifier.replace(/\s/g, ""))) {
      return "Please enter a valid email address or phone number.";
    }
    if (!password) {
      return "Password is required.";
    }
    if (!isStrongPassword(password)) {
      return "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null; // no errors
  };

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setToast({ type: "error", msg: validationError });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      // Role is intentionally NOT sent — the server always assigns 'student' by default
      await authService.register({
        name:       name.trim(),
        identifier: identifier.trim(),
        password,
      });

      setToast({ type: "success", msg: "Account created! You can now sign in." });

      // Reset form
      setName("");
      setIdentifier("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      setToast({ type: "error", msg: error.message || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return {
    name, setName,
    identifier, setIdentifier,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPass, setShowPass,
    showConfirmPass, setShowConfirmPass,
    loading,
    toast,
    handleSubmit,
  };
}
