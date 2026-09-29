// src/features/auth/hooks/useLogin.js

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export function useLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [remember, setRemember]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  const navigate                    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      setToast({ type: "error", msg: "Please fill in all fields." });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const { user } = await authService.login({ identifier, password });

      // Store user info so dashboard can read role and name
      localStorage.setItem("user", JSON.stringify(user));

      setToast({ type: "success", msg: "Logged in successfully! Redirecting..." });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setToast({ type: "error", msg: err.message || "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return {
    identifier, setIdentifier,
    password, setPassword,
    showPass, setShowPass,
    remember, setRemember,
    loading,
    toast,
    handleSubmit,
  };
}