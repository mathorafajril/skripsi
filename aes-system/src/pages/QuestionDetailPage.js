import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DashboardHeader } from "../features/dashboard/components/DashboardHeader";
import { useQuestionDetail } from "../features/questions/hooks/useQuestionDetail";
import { ACCESS_TOKEN_NAME } from "../features/auth"; // ✅ fix missing import
import styles from "../styles/questionDetailStyles";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // ✅ define API base URL

export default function QuestionDetailPage() {
  const { question_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const classIdFromState = location.state?.classId;
  const questionFromState = location.state?.question || null;

  const {
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
  } = useQuestionDetail(question_id, questionFromState);

  const classId = questionData?.class_id || classIdFromState;

  const handleBack = () => {
    navigate(classId ? `/classes/${classId}` : "/dashboard");
  };

  // Helper for delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this question? This action cannot be undone if there are no answers. If students have already answered, deletion will be blocked.")) return;
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      const res = await fetch(`${API_BASE_URL}/classes/questions/${question_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      // Navigate back to class detail page
      navigate(`/classes/${classId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Loading ──
  if (loading && !questionData) {
    return (
      <div style={styles.page}>
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div style={styles.loadingContainer}>Loading question...</div>
      </div>
    );
  }

  // ── Error ──
  if (error && !questionData) {
    return (
      <div style={styles.page}>
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div style={styles.container}>
          <button style={styles.backButton} onClick={handleBack}>← Back</button>
          <div style={{ ...styles.errorMessage, marginTop: "24px" }}>
            <strong>Failed to load question:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!questionData) {
    return (
      <div style={styles.page}>
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div style={styles.container}>
          <button style={styles.backButton} onClick={handleBack}>← Back</button>
          <div style={{ ...styles.errorMessage, marginTop: "24px" }}>
            Question not found.
          </div>
        </div>
      </div>
    );
  }

  // ── Derived stats (admin only) ──
  const totalAnswers  = answers.length;
  const isAnswered    = totalAnswers > 0;
  const scoredAnswers = answers.filter(
    (a) => a.score_ai !== null && a.score_ai !== undefined
  );
  const isEvaluated   = scoredAnswers.length > 0;
  const avgScore      = isEvaluated
    ? (
        scoredAnswers.reduce((sum, a) => sum + Number(a.score_ai), 0) /
        scoredAnswers.length
      ).toFixed(1)
    : null;
  const releasedCount = answers.filter((a) => a.score_released).length;
  const canRelease    = isEvaluated && !releasing;

  return (
    <div style={styles.page}>
      <DashboardHeader user={user} onLogout={handleLogout} />

      <div style={styles.container}>

        {/* ── Top Bar ── */}
        <div style={styles.topBar}>
          <button style={styles.backButton} onClick={handleBack}>
            ← Back to Class
          </button>

          <div style={styles.actionButtons}>
            {isAdmin ? (
              <>
                <button
                  style={styles.editButton}
                  onClick={() => navigate(`/edit-question/${question_id}`, { state: { question: questionData, classId: classId } })}
                >
                  ✏️ Edit Question
                </button>

                <button
                  style={styles.deleteButton}
                  onClick={handleDelete}
                >
                  🗑️ Delete Question
                </button>

                <button
                  style={publishing ? styles.publishButtonDisabled : styles.publishButton}
                  onClick={togglePublish}
                  disabled={publishing}
                >
                  {publishing
                    ? "Updating..."
                    : questionData.is_published
                    ? "Unpublish"
                    : "Publish"}
                </button>

                <button
                  style={canRelease ? styles.releaseButton : styles.releaseButtonDisabled}
                  onClick={releaseScores}
                  disabled={!canRelease}
                >
                  {releasing ? "Releasing..." : "🚀 Release Scores"}
                </button>
              </>
            ) : (
              <>
                <button
                  style={styles.viewResultsButton}
                  onClick={() => navigate(`/questions/${question_id}/results`)}
                >
                  📊 View Results
                </button>
                <button
                  style={styles.answerButton}
                  onClick={() => navigate(`/questions/${question_id}/answer`)}
                >
                  ✍️ Answer Question
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Action Feedback ── */}
        {actionMessage && (
          <div
            style={
              actionMessage.type === "success"
                ? styles.successMessage
                : styles.errorMessage
            }
          >
            {actionMessage.text}
          </div>
        )}

        {/* ── Question Card ── */}
        <div style={styles.questionCard}>
          <div style={styles.questionCardHeader}>
            <h2 style={styles.questionTitle}>Question</h2>
            <span style={questionData.is_published ? styles.publishedBadge : styles.draftBadge}>
              {questionData.is_published ? "Published" : "Draft"}
            </span>
          </div>

          <p style={styles.questionText}>{questionData.question}</p>

          {/* Key Answer — admin only */}
          {isAdmin && (
            <>
              <div style={styles.divider} />
              <h3 style={styles.keyAnswerTitle}>Key Answer</h3>
              <p style={styles.keyAnswerText}>{questionData.key_answer}</p>
            </>
          )}
        </div>

        {/* ── Evaluation Status — admin only ── */}
        {isAdmin && (
          <div style={styles.statusSection}>
            <h3 style={styles.sectionTitle}>Evaluation Status</h3>

            {loading && (
              <p style={{ color: "#718096", fontSize: "14px" }}>
                Checking answers...
              </p>
            )}

            {/* No answers */}
            {!loading && !isAnswered && (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>📭</span>
                <p style={styles.emptyText}>No answers submitted yet.</p>
                <p style={styles.emptySubText}>
                  {questionData.is_published
                    ? "Waiting for students to submit their answers."
                    : "Publish this question so students can submit answers."}
                </p>
                <button style={styles.evaluateButtonDisabled} disabled>
                  Run AI Evaluation
                </button>
              </div>
            )}

            {/* Answers present, not evaluated */}
            {!loading && isAnswered && !isEvaluated && (
              <div style={styles.pendingEvalState}>
                <p style={styles.pendingText}>
                  {totalAnswers} answer{totalAnswers !== 1 ? "s" : ""} submitted —
                  not yet evaluated.
                </p>
                <button
                  style={evaluating ? styles.evaluateButtonDisabled : styles.evaluateButton}
                  onClick={triggerEvaluation}
                  disabled={evaluating}
                >
                  {evaluating ? "Evaluating..." : "▶ Run AI Evaluation"}
                </button>
              </div>
            )}

            {/* Evaluation summary */}
            {!loading && isAnswered && isEvaluated && (
              <div style={styles.summarySection}>
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{totalAnswers}</span>
                    <span style={styles.statLabel}>Total Answers</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{scoredAnswers.length}</span>
                    <span style={styles.statLabel}>Scored</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{avgScore}</span>
                    <span style={styles.statLabel}>Avg. AI Score</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statValue}>{releasedCount}</span>
                    <span style={styles.statLabel}>Released</span>
                  </div>
                </div>

                <button
                  style={styles.viewResultsButton}
                  onClick={() => navigate(`/questions/${question_id}/results`)}
                >
                  View Full Results →
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}