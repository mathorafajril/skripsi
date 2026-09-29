// src/pages/ResultAnalysisPage.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useResults } from "../features/results";
import { ResultsTable } from "../features/results";
import { useClassResults } from "../features/results/hooks/useClassResults";
import QuestionScoreChart from "../features/results/components/QuestionScoreChart";
import ClassScoreDistributionChart from "../features/results/components/ClassScoreDistributionChart";
import { DashboardHeader } from "../features/dashboard/components/DashboardHeader";
import styles from "../styles/resultAnalysisStyles";

export default function ResultAnalysisPage() {
  const { question_id } = useParams();
  const navigate = useNavigate();

  // ── Auth ───────────────────────────────────────────────────────────────────
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ── Per-question data ──────────────────────────────────────────────────────
  const {
    questionData,
    answers,
    loading,
    error,
    evaluating,
    releasing,
    actionMessage,
    triggerEvaluation,
    releaseScores,
    refetch,
  } = useResults(question_id);

  // ── Derived state ──────────────────────────────────────────────────────────
  const totalAnswers = answers.length;
  const scoredCount = answers.filter(
    (a) => a.score_ai !== null && a.score_ai !== undefined
  ).length;
  const releasedCount = answers.filter((a) => a.score_released).length;
  const avgScore =
    scoredCount > 0
      ? answers.reduce((sum, a) => sum + Number(a.score_ai ?? 0), 0) / scoredCount
      : null;

  const hasAnswers = totalAnswers > 0;
  const hasEvaluated = scoredCount > 0;
  const allReleased = releasedCount === totalAnswers && totalAnswers > 0;

  // ── Score distribution for chart (1–5 scale) ──────────────────────────────
  const getDistributionData = (answers) => {
    const ranges = [
      { range: "1.00–1.99", min: 1, max: 1.99, color: "#e53e3e" },
      { range: "2.00–2.99", min: 2, max: 2.99, color: "#d69e2e" },
      { range: "3.00–3.99", min: 3, max: 3.99, color: "#3182ce" },
      { range: "4.00–5.00", min: 4, max: 5, color: "#38a169" },
    ];
    return ranges.map((r) => ({
      range: r.range,
      count: answers.filter((a) => {
        const s = a.score_ai;
        return s !== null && s !== undefined && s >= r.min && s <= r.max;
      }).length,
      color: r.color,
    }));
  };

  const distributionData = getDistributionData(answers);

  // ── Class-level results (only fetched for admin after questionData loads) ──
  const classId = questionData?.class_id ?? null;
  const { classResults, loading: classLoading } = useClassResults(
    isAdmin ? classId : null
  );

  // ── Chart visibility toggle ────────────────────────────────────────────────
  const [showCharts, setShowCharts] = useState(true);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div style={styles.loadingContainer}>Loading results…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div style={styles.container}>
          <div style={styles.errorMessage}>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <DashboardHeader user={user} onLogout={handleLogout} />

      <div style={styles.container}>
        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div style={styles.topBar}>
          <button
            style={styles.backButton}
            onClick={() =>
              navigate(
                questionData?.class_id
                  ? `/classes/${questionData.class_id}`
                  : "/dashboard"
              )
            }
          >
            ← Back
          </button>

          {isAdmin && hasEvaluated && (
            <div style={styles.actionButtons}>
              <button
                style={
                  releasing || allReleased
                    ? styles.releaseButtonDisabled
                    : styles.releaseButton
                }
                onClick={releaseScores}
                disabled={releasing || allReleased}
              >
                {releasing
                  ? "Releasing…"
                  : allReleased
                  ? "✅ Scores Released"
                  : "🔓 Release Scores"}
              </button>
            </div>
          )}
        </div>

        {/* ── Action feedback ───────────────────────────────────────────────── */}
        {actionMessage?.text && (
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

        {/* ── Question card ─────────────────────────────────────────────────── */}
        {questionData && (
          <div style={styles.questionCard}>
            <p style={styles.questionText}>{questionData.question}</p>
            {isAdmin && questionData.key_answer && (
              <>
                <hr style={{ borderColor: "#e2e8f0", margin: "12px 0" }} />
                <p
                  style={{
                    fontSize: "12px",
                    color: "#718096",
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Key Answer
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#2b6cb0",
                    borderLeft: "3px solid #3182ce",
                    paddingLeft: "10px",
                    fontSize: "14px",
                  }}
                >
                  {questionData.key_answer}
                </p>
              </>
            )}
          </div>
        )}

        {/* ── States ───────────────────────────────────────────────────────── */}

        {/* 1 — No answers */}
        {!hasAnswers && (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "48px" }}>📭</div>
            <p>No answers submitted yet.</p>
            <p style={{ fontSize: "13px", color: "#a0aec0" }}>
              Make sure the question is published so students can answer it.
            </p>
          </div>
        )}

        {/* 2 — Answers, not evaluated (admin) */}
        {hasAnswers && !hasEvaluated && isAdmin && (
          <div style={styles.pendingEvalState}>
            <span>
              📝 {totalAnswers} answer{totalAnswers !== 1 ? "s" : ""} submitted —
              ready for AI evaluation.
            </span>
            <button
              style={
                evaluating ? styles.evaluateButtonDisabled : styles.evaluateButton
              }
              onClick={triggerEvaluation}
              disabled={evaluating}
            >
              {evaluating ? "Evaluating…" : "🤖 Run AI Evaluation"}
            </button>
          </div>
        )}

        {/* 3 — Answers, not evaluated (student) */}
        {hasAnswers && !hasEvaluated && !isAdmin && (
          <div style={styles.statusSection}>
            <p style={{ textAlign: "center", color: "#718096" }}>
              ⏳ Your score has not been released yet. Check back later.
            </p>
          </div>
        )}

        {/* 4 — Evaluated */}
        {hasAnswers && hasEvaluated && (
          <>
            {/* Stats grid */}
            <div style={styles.statsGrid}>
              <StatCard value={totalAnswers} label="Total Answers" />
              <StatCard value={scoredCount} label="Scored" />
              <StatCard
                value={avgScore !== null ? avgScore.toFixed(2) : "—"}
                label="Avg AI Score"
              />
              <StatCard
                value={`${releasedCount} / ${totalAnswers}`}
                label="Released"
              />
            </div>

            {/* Re-evaluate button */}
            {isAdmin && (
              <div style={{ marginBottom: "16px" }}>
                <button
                  style={
                    evaluating ? styles.evaluateButtonDisabled : styles.evaluateButton
                  }
                  onClick={triggerEvaluation}
                  disabled={evaluating}
                >
                  {evaluating ? "Evaluating…" : "🔄 Re-run AI Evaluation"}
                </button>
              </div>
            )}

            {/* ── Score Distribution Chart (replaces box summary) ──────────── */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>📊 Score Distribution (1–5 scale)</h3>
              <p style={styles.chartSubtitle}>
                Number of students in each score range.
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={distributionData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#edf2f7"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 12, fill: "#4a5568" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#718096" }}
                    label={{
                      value: "Number of students",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 11, fill: "#718096" },
                    }}
                  />
                  <Tooltip
                    formatter={(value) =>
                      `${value} student${value !== 1 ? "s" : ""}`
                    }
                    labelFormatter={(label) => `Score range: ${label}`}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {distributionData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={entry.count > 0 ? entry.color : "#e2e8f0"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── Charts (main per-question & class overview) ────────────── */}
            {isAdmin && (
              <div style={{ marginTop: "24px" }}>
                <button
                  style={styles.chartToggleButton}
                  onClick={() => setShowCharts((v) => !v)}
                >
                  {showCharts ? "▲ Hide Charts" : "▼ Show Charts"}
                </button>

                {showCharts && (
                  <>
                    {/* Chart 1: Per-question scores */}
                    <div style={styles.chartCard}>
                      <h3 style={styles.chartTitle}>
                        📊 Score Distribution — This Question
                      </h3>
                      <p style={styles.chartSubtitle}>
                        Individual AI scores for each student who answered this
                        question.
                      </p>
                      <QuestionScoreChart answers={answers} avgScore={avgScore} />
                    </div>

                    {/* Chart 2: Class average – uncomment when ready */}
                    {/*
                    <div style={styles.chartCard}>
                      <h3 style={styles.chartTitle}>
                        📈 Average Score by Question — Class Overview
                      </h3>
                      <p style={styles.chartSubtitle}>
                        Average AI score for every evaluated question in this class.
                      </p>
                      {classLoading ? (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#a0aec0" }}>
                          Loading class data…
                        </div>
                      ) : (
                        <ClassScoreDistributionChart classResults={classResults} />
                      )}
                    </div>
                    */}
                  </>
                )}
              </div>
            )}

            {/* ── Results table ─────────────────────────────────────────────── */}
            <div style={{ ...styles.sectionCard, marginTop: "24px" }}>
              <h3 style={styles.sectionTitle}>Student Results</h3>
              <ResultsTable results={answers} role={user?.role} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Helper component ───────────────────────────────────────────────────────────
function StatCard({ value, label }) {
  const s = {
    card: {
      background: "#fff",
      borderRadius: "10px",
      padding: "16px",
      textAlign: "center",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    },
    value: { fontSize: "26px", fontWeight: 700, color: "#2d3748", margin: 0 },
    label: { fontSize: "12px", color: "#718096", marginTop: "4px" },
  };
  return (
    <div style={s.card}>
      <p style={s.value}>{value}</p>
      <p style={s.label}>{label}</p>
    </div>
  );
}