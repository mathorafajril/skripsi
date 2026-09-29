import { useState, useEffect, useCallback } from "react";
import { ACCESS_TOKEN_NAME } from "../../auth";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function useAnswerQuestion(questionId) {
  const [questionData, setQuestionData] = useState(null);
  const [existingAnswer, setExistingAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
    "Content-Type": "application/json",
  });

  // Fetch question info and any existing answer from the results endpoint.
  // For students, results returns their own answer row (if any).
  const fetchQuestion = useCallback(async () => {
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
        throw new Error(errBody.message || "Failed to load question.");
      }
      const data = await res.json();

      if (Array.isArray(data.results)) {
        const rows = data.results;
        const first = rows[0] || null;

        if (first) {
          setQuestionData({
            question_id:  first.question_id,
            class_id:     first.class_id,
            question:     first.question,
            is_published: first.is_published,
          });
          // first row is the student's own answer (if they have one)
          setExistingAnswer(first.answer || null);
        }
      } else if (data.question) {
        setQuestionData(data.question);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const submitAnswer = async (answerText) => {
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/classes/questions/${questionId}/answer`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ answer: answerText }),
        }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "Failed to submit answer.");
      }
      setSubmitMessage({ type: "success", text: "Answer submitted successfully!" });
      setExistingAnswer(answerText);
    } catch (err) {
      setSubmitMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    questionData,
    existingAnswer,
    loading,
    submitting,
    error,
    submitMessage,
    submitAnswer,
  };
}