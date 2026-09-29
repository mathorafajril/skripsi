import { useState, useEffect, useCallback } from "react";
import { ACCESS_TOKEN_NAME } from "../../auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// initialQuestion — question object passed from router state (from QuestionCard).
// Used immediately so the page renders even when results are empty.
export function useQuestionDetail(questionId, initialQuestion = null) {
  const [questionData, setQuestionData] = useState(initialQuestion);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
    "Content-Type": "application/json",
  });

  const fetchData = useCallback(async () => {
    if (!questionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/classes/questions/${questionId}/results`,
        { headers: getHeaders() }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Request failed with status ${res.status}`);
      }

      const data = await res.json();

      // Shape: { results: [...] }
      // Each row is an answer with question fields embedded.
      // When there are no answers the array is empty — in that case we keep
      // whatever questionData we already have (from initialQuestion / router state).
      if (Array.isArray(data.results)) {
        const rows = data.results;
        setAnswers(rows);

        if (rows.length > 0) {
          const first = rows[0];
          setQuestionData({
            question_id:  first.question_id,
            class_id:     first.class_id,
            question:     first.question,
            key_answer:   first.key_answer,
            is_published: first.is_published,
            created_at:   first.created_at,
            updated_at:   first.updated_at,
          });
        }
        // If rows is empty, leave questionData as-is (initialQuestion from state)
        return;
      }

      // Fallback: { question: {...}, answers: [...] }
      if (data.question) {
        setQuestionData(data.question);
        setAnswers(data.answers || []);
        return;
      }

      // Nothing matched — but don't overwrite a good initialQuestion
      if (!questionData) {
        throw new Error(
          `Unexpected API response shape. Keys received: ${Object.keys(data).join(", ")}`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerEvaluation = async () => {
    setEvaluating(true);
    setActionMessage(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/classes/questions/${questionId}/evaluate`,
        { method: "POST", headers: getHeaders() }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "Evaluation failed. Please try again.");
      }
      setActionMessage({ type: "success", text: "AI evaluation completed successfully." });
      fetchData();
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
      const res = await fetch(
        `${API_BASE_URL}/classes/questions/${questionId}/release`,
        { method: "PATCH", headers: getHeaders() }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "Failed to release scores. Please try again.");
      }
      setActionMessage({ type: "success", text: "Scores released to students successfully." });
      fetchData();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setReleasing(false);
    }
  };

  const togglePublish = async () => {
    setPublishing(true);
    setActionMessage(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/classes/questions/${questionId}/publish`,
        { method: "PATCH", headers: getHeaders() }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "Failed to update question status.");
      }
      setActionMessage({ type: "success", text: "Question status updated." });
      fetchData();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setPublishing(false);
    }
  };

  return {
    questionData,
    answers,
    loading,
    error,
    evaluating,
    releasing,
    publishing,
    actionMessage,
    triggerEvaluation,
    releaseScores,
    togglePublish,
    refetch: fetchData,
  };
}