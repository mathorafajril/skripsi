// src/features/classes/hooks/useCreateClass.js

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN_NAME } from "../../auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function useCreateClass() {
  const [name, setName]             = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  const navigate                    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setToast({ type: "error", msg: "Class name is required." });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      const res   = await fetch(`${API_BASE_URL}/classes`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create class.");

      setToast({ type: "success", msg: "Class created successfully!" });
      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (err) {
      setToast({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    name, setName,
    description, setDescription,
    loading,
    toast,
    handleSubmit,
  };
}
