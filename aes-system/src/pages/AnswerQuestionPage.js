import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DashboardHeader } from "../features/dashboard/components/DashboardHeader";
import { useAnswerQuestion } from "../features/questions/hooks/useAnswerQuestion";
import styles from "../styles/answerQuestionStyles";

export default function AnswerQuestionPage() {
  const { question_id } = useParams();
  const navigate        = useNavigate();
  const location        = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const classIdFromState   = location.state?.classId;
  const questionFromState  = location.state?.question;

  const {
    questionData,
    existingAnswer,
    loading,
    submitting,
    error,
    submitMessage,
    submitAnswer,
  } = useAnswerQuestion(question_id);

  // Resolve question text: use API data when available, fall back to router state
  const question = questionData || questionFromState || null;
  const classId  = question?.class_id || classIdFromState;

  const [answer, setAnswer]     = useState("");
  const [focused, setFocused]   = useState(false);

  const handleBack = () => navigate(classId ? `/classes/${classId}` : "/dashboard");

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    await submitAnswer(answer.trim());
  };

  // ── Loading ──
  if (loading && !question) {
    return (
      <div style={styles.page}>
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div style={styles.loadingContainer}>Loading question...</div>
      </div>
    );
  }

  // ── Error ──
  if (error && !question) {
    return (
      <div style={styles.page}>
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div style={styles.container}>
          <button style={styles.backButton} onClick={handleBack}>← Back</button>
          <div style={styles.errorMessage}><strong>Error:</strong> {error}</div>
        </div>
      </div>
    );
  }

  const isAlreadyAnswered = !!existingAnswer;
  const isSubmitDone      = submitMessage?.type === "success";

  return (
    <div style={styles.page}>
      <DashboardHeader user={user} onLogout={handleLogout} />

      <div style={styles.container}>
        <button style={styles.backButton} onClick={handleBack}>
          ← Back to Class
        </button>

        {/* ── Question ── */}
        {question && (
          <div style={styles.questionCard}>
            <p style={styles.questionLabel}>Question</p>
            <p style={styles.questionText}>{question.question}</p>
          </div>
        )}

        {/* ── Already answered notice ── */}
        {isAlreadyAnswered && !isSubmitDone && (
          <div style={styles.answeredBanner}>
            ✅ You have already submitted an answer. You can update it below.
          </div>
        )}

        {/* ── Feedback ── */}
        {submitMessage && (
          <div
            style={
              submitMessage.type === "success"
                ? styles.successMessage
                : styles.errorMessage
            }
          >
            {submitMessage.text}
          </div>
        )}

        {/* ── Answer form ── */}
        <div style={styles.formCard}>
          <label style={styles.formLabel}>Your Answer</label>

          <textarea
            style={focused ? styles.textareaFocus : styles.textarea}
            placeholder={
              isAlreadyAnswered
                ? "Your previous answer is shown here — you can edit and resubmit."
                : "Write your answer here..."
            }
            value={answer || (isAlreadyAnswered && !answer ? existingAnswer : answer)}
            onChange={(e) => setAnswer(e.target.value)}
            onFocus={() => {
              setFocused(true);
              // Pre-fill textarea with existing answer on first focus
              if (!answer && existingAnswer) setAnswer(existingAnswer);
            }}
            onBlur={() => setFocused(false)}
            disabled={submitting}
          />

          <p style={styles.charCount}>{answer.length} characters</p>

          <div style={styles.footer}>
            <button style={styles.backButton} onClick={handleBack}>
              Cancel
            </button>
            <button
              style={
                submitting || !answer.trim()
                  ? styles.submitButtonDisabled
                  : styles.submitButton
              }
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
            >
              {submitting
                ? "Submitting..."
                : isAlreadyAnswered
                ? "Update Answer"
                : "Submit Answer"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}