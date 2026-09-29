// src/features/results/hooks/useResults.js
import { useState, useEffect, useCallback } from "react";
import { ACCESS_TOKEN_NAME } from "../../auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function useResults(questionId) {
  const [questionData, setQuestionData] = useState(null);
  const [answers, setAnswers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [evaluating, setEvaluating]     = useState(false);
  const [releasing, setReleasing]       = useState(false);
  const [actionMessage, setActionMessage] = useState(null); // { type: "success"|"error", text }

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      const res = await fetch(
        `${API_BASE_URL}/classes/questions/${questionId}/results`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch results");
      const data = await res.json();

      // ✅ Correct: API returns { results: [...] }
      // Each row contains both question fields AND answer fields
      if (Array.isArray(data.results)) {
        const rows = data.results;

        // Extract question metadata from first row (same across all rows)
        if (rows.length > 0) {
          const first = rows[0];
          setQuestionData({
            question_id:  first.question_id,
            class_id:     first.class_id,
            question:     first.question,
            key_answer:   first.key_answer,
            is_published: first.is_published,
          });
        }

        // Full rows array IS the answers list
        setAnswers(rows);
      } else {
        // Fallback for { question, answers } shape (forward compat)
        setQuestionData(data.question ?? null);
        setAnswers(data.answers ?? []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const triggerEvaluation = async () => {
    setEvaluating(true);
    setActionMessage(null);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      const res = await fetch(
        `${API_BASE_URL}/classes/questions/${questionId}/evaluate`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();                   // ← parse JSON first
      if (!res.ok) throw new Error(data.message || "Evaluation failed. Please try again.");
      
      const timeMsg = data.elapsedMs ? ` (${data.elapsedMs} ms)` : '';
      setActionMessage({ type: "success", text: `Evaluation complete! Scores updated.${timeMsg}` });
      await fetchResults(); // Refresh table after evaluation
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setEvaluating(false);
    }
  };

  const releaseScores = async () => {
    setReleasing(true);
    setActionMessage(null);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      const res = await fetch(
        `${API_BASE_URL}/classes/questions/${questionId}/release`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to release scores. Please try again.");
      setActionMessage({ type: "success", text: "Scores released to students!" });
      await fetchResults(); // ✅ Refresh table after release
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setReleasing(false);
    }
  };

  return {
    questionData,
    answers,
    loading,
    error,
    evaluating,
    releasing,
    actionMessage,
    triggerEvaluation,
    releaseScores,
    refetch: fetchResults,
  };
}