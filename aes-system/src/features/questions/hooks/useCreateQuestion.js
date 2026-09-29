// src/features/questions/hooks/useCreateQuestion.js

import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { ACCESS_TOKEN_NAME }   from "../../auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function useCreateQuestion() {
  const [classes, setClasses]       = useState([]);
  const [classId, setClassId]       = useState("");
  const [question, setQuestion]     = useState("");
  const [keyAnswer, setKeyAnswer]   = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  const navigate                    = useNavigate();

  const token = localStorage.getItem(ACCESS_TOKEN_NAME);

  // Fetch admin's classes to populate the dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setClasses(data.classes || []);
      } catch {
        // silently fail — user will see empty dropdown
      }
    };
    if (token) fetchClasses();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!classId || !question.trim() || !keyAnswer.trim()) {
      setToast({ type: "error", msg: "Class, question, and key answer are all required." });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const res  = await fetch(`${API_BASE_URL}/classes/questions`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          class_id:     classId,
          question:     question.trim(),
          key_answer:   keyAnswer.trim(),
          is_published: isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create question.");

      setToast({ type: "success", msg: "Question created successfully!" });
      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (err) {
      setToast({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    classes,
    classId, setClassId,
    question, setQuestion,
    keyAnswer, setKeyAnswer,
    isPublished, setIsPublished,
    loading,
    toast,
    handleSubmit,
  };
}
