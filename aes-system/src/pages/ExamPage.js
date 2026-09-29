import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN_NAME } from "../features/auth";
import useExamTimer from "../features/classes/hooks/useExamTimer";
import styles from "../styles/examPageStyles";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function ExamPage() {
  const { class_id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const token = localStorage.getItem(ACCESS_TOKEN_NAME);

  // Fetch class + questions
  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/classes/${class_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load exam");
        const data = await res.json();
        setClassData(data);
        setQuestions(data.questions);

        // Pre-fill existing answers
        const existing = {};
        data.questions.forEach((q) => {
          if (q.is_answered) {
            existing[q.question_id] = ""; // We'll fetch actual answer text
          }
        });
        // Fetch each answer text (optional: batch endpoint)
        for (const q of data.questions) {
          if (q.is_answered) {
            const ansRes = await fetch(`${API_BASE_URL}/classes/questions/${q.question_id}/answer`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (ansRes.ok) {
              const ansData = await ansRes.json();
              existing[q.question_id] = ansData.answer || "";
            }
          }
        }
        setAnswers(existing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [class_id, token]);

const timer = useExamTimer(
  classData?.exam_start_time ?? null,
  classData?.exam_duration_minutes ?? null
);

// Redirect to class page if exam is not active (wait for hook to settle)
useEffect(() => {
  if (!classData) return; // still loading

  // If no exam schedule is set, decide what to do:
  // Set this to false to allow access when no schedule exists.
  // Currently, no schedule means "not active" -> redirect.
  if (!classData.exam_start_time) {
    navigate(`/classes/${class_id}`);
    return;
  }

  // Wait for the timer hook to finish computing (status not 'none')
  if (timer.status === 'none') return;

  // Only stay if active; otherwise redirect
  if (timer.status !== 'active') {
    navigate(`/classes/${class_id}`);
  }
}, [classData, timer.status, class_id, navigate]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const submitAnswer = async (questionId) => {
    const answerText = answers[questionId];
    if (!answerText || answerText.trim() === "") {
      setMessage({ type: "error", text: "Answer cannot be empty" });
      return;
    }
    setSubmitting((prev) => ({ ...prev, [questionId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/classes/questions/${questionId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answer: answerText }),
      });
      if (!res.ok) throw new Error("Failed to save answer");
      const data = await res.json();
      setAnswers((prev) => ({ ...prev, [questionId]: data.answer.answer }));
      setMessage({ type: "success", text: "Answer saved!" });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  if (loading) return <div style={styles.loading}>Loading exam...</div>;
  if (error) return <div style={styles.error}>Error: {error}</div>;
  if (!classData) return null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(`/classes/${class_id}`)}>
            ← Back to Class
          </button>
          <div style={styles.timer}>
            {timer.status === "active" && (
              <span style={styles.timerText}>
                Time left: {formatCountdown(timer.secondsRemaining)}
              </span>
            )}
          </div>
        </div>

        <h1 style={styles.className}>{classData.name}</h1>
        {classData.description && <p style={styles.classDesc}>{classData.description}</p>}

        {message && (
          <div style={message.type === "success" ? styles.successMsg : styles.errorMsg}>
            {message.text}
          </div>
        )}

        <div style={styles.questionsList}>
          {questions.map((q, idx) => (
            <div key={q.question_id} style={styles.questionCard}>
              <h3 style={styles.questionTitle}>
                Question {idx + 1}: {q.question}
              </h3>
              <textarea
                style={styles.textarea}
                rows={5}
                placeholder="Write your answer here..."
                value={answers[q.question_id] || ""}
                onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
                disabled={timer.status !== "active"}
              />
              <div style={styles.buttonRow}>
                <button
                  style={styles.submitButton}
                  onClick={() => submitAnswer(q.question_id)}
                  disabled={submitting[q.question_id] || timer.status !== "active"}
                >
                  {submitting[q.question_id] ? "Saving..." : "Save Answer"}
                </button>
                {answers[q.question_id] && (
                  <span style={styles.savedBadge}>✓ Saved</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatCountdown(seconds) {
  if (!seconds) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}