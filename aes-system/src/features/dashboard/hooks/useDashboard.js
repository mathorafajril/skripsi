// src/features/dashboard/hooks/useDashboard.js
// Handles fetching classes and joining a class for the dashboard.

import { useState, useEffect, useCallback } from "react";
import { useNavigate }                       from "react-router-dom";
import { ACCESS_TOKEN_NAME }                 from "../../auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function useDashboard() {
  const [classes, setClasses]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode]   = useState("");
  const [joining, setJoining]       = useState(false);

  const navigate = useNavigate();

  // ── Read user info from localStorage ─────────────────────────────────────
  const token = localStorage.getItem(ACCESS_TOKEN_NAME);
  const user  = JSON.parse(localStorage.getItem("user") || "{}");
  const role  = user.role || "student";

  // ── Redirect to login if no token ─────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // ── Fetch classes ─────────────────────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch classes.");
      setClasses(data.classes || []);
    } catch (err) {
      setToast({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchClasses();
  }, [fetchClasses, token]);

  // ── Join a class (student only) ───────────────────────────────────────────
  const handleJoinClass = async (e) => {
    e.preventDefault();

    if (!classCode.trim()) {
      setToast({ type: "error", msg: "Please enter a join code." });
      return;
    }

    setJoining(true);
    setToast(null);

    try {
      const res = await fetch(`${API_BASE_URL}/classes/join`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        // Send join_code — backend looks up class by this short code
        body: JSON.stringify({ join_code: classCode.trim().toUpperCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join class.");

      setToast({ type: "success", msg: data.message });
      setClassCode("");
      setShowJoinModal(false);
      fetchClasses();
    } catch (err) {
      setToast({ type: "error", msg: err.message });
    } finally {
      setJoining(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/user/logout`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Always clear locally even if server call fails
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_NAME);
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  return {
    user,
    role,
    classes,
    loading,
    toast,
    showJoinModal, setShowJoinModal,
    classCode, setClassCode,
    joining,
    handleJoinClass,
    handleLogout,
  };
}