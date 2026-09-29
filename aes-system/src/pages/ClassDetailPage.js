// src/pages/ClassDetailPage.js
//
// Class detail page — shows class info and question list (admin) or two action buttons (student).
// Admin : always sees questions; can open ExamScheduleModal to set timing.
// Student : sees "Take Exam" and "View My Results" when exam is active or no schedule exists.
//           Countdown banner appears; auto-redirects to dashboard on exam end.

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useClassDetail } from "../features/classes";
import QuestionCard from "../features/classes/components/QuestionCard";
import ExamTimerBanner from "../features/classes/components/ExamTimerBanner";
import ExamScheduleModal from "../features/classes/components/ExamScheduleModal";
import useExamTimer from "../features/classes/hooks/useExamTimer";
import examTimerStyles from "../styles/examTimerStyles";
import {
  dashboardPageStyle,
  dashboardContentStyle,
  headerStyle,
  headerLogoStyle,
  headerActionsStyle,
  headerButtonStyle,
} from "../styles/dashboardStyles";
import {
  innerStyle,
  headerBlockStyle,
  classNameStyle,
  classDescStyle,
  metaBadgeStyle,
  sectionTitleStyle,
  emptyBoxStyle,
  emptyIconStyle,
  emptyTitleStyle,
  emptyTextStyle,
  errorBoxStyle,
  loadingTextStyle,
  studentActionsStyle,
  examButtonStyle,
  resultsButtonStyle,
} from "../styles/classDetailStyles";


export default function ClassDetailPage() {
  const { class_id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  const { classData, questions, loading, error, refetch } =
    useClassDetail(class_id);

  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // ── Exam timer ─────────────────────────────────────────────
  const handleStatusChange = useCallback(
    (prevStatus, nextStatus) => {
      if (nextStatus === "active") {
        // Exam just opened — refetch so student sees their questions
        refetch();
      }
      // if (nextStatus === "ended" && role === "student") {
      //   // Exam just ended — brief pause then redirect to dashboard
      //   setTimeout(() => navigate("/dashboard"), 2500);
      // }
    },
    [refetch, navigate, role]
  );

  const timer = useExamTimer(
    classData?.exam_start_time ?? null,
    classData?.exam_duration_minutes ?? null,
    handleStatusChange
  );

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div style={dashboardPageStyle}>
        <header style={headerStyle}>
          <div style={headerLogoStyle}>AES System</div>
          <div style={headerActionsStyle}>
            <button style={headerButtonStyle} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <div style={dashboardContentStyle}>
          <p style={loadingTextStyle}>Loading class…</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div style={dashboardPageStyle}>
        <header style={headerStyle}>
          <div style={headerLogoStyle}>AES System</div>
          <div style={headerActionsStyle}>
            <button style={headerButtonStyle} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <div style={dashboardContentStyle}>
          <div style={errorBoxStyle}>{error}</div>
        </div>
      </div>
    );
  }

  const isAdmin = role === "admin";
  const examStatus = timer.status;

  // Student sees locked card when exam is upcoming or ended
  const isLocked =
    !isAdmin && (examStatus === "upcoming" || examStatus === "ended");

  // ── Main render ────────────────────────────────────────────
  return (
    <div style={dashboardPageStyle}>

      {/* ── Header ──────────────────────────────────────────── */}
      <header style={headerStyle}>
        <div style={headerLogoStyle}>AES System</div>
        <div style={headerActionsStyle}>
          <span style={{ color: "#4a5568", fontSize: "14px" }}>
            {user.name}
          </span>
          <button style={headerButtonStyle} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ── Page body ───────────────────────────────────────── */}
      <div style={dashboardContentStyle}>
        <div style={innerStyle}>

          {/* ── Back + class info ───────────────────────────── */}
          <div style={headerBlockStyle}>
            <button
              style={headerButtonStyle}
              onClick={() => navigate("/dashboard")}
            >
              ← Back
            </button>
            <button
              style={headerButtonStyle}
              onClick={() => navigate(`/classes/${class_id}/leaderboard`)}
            >
              🏆 Leaderboard
            </button>

            <div style={{ flex: 1 }}>
              <h1 style={classNameStyle}>{classData?.name}</h1>
              {classData?.description && (
                <p style={classDescStyle}>{classData.description}</p>
              )}
            </div>

            <span style={metaBadgeStyle}>
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ── Exam timer banner ────────────────────────────── */}
          <ExamTimerBanner
            role={role}
            timer={timer}
            classData={classData}
            onEditSchedule={() => setShowScheduleModal(true)}
          />

          {/* ── Section title ────────────────────────────────── */}
          <h2 style={sectionTitleStyle}>
            {isAdmin ? "Questions" : "Exam Actions"}
          </h2>

          {isAdmin ? (
            /* ── ADMIN: Show the list of questions (existing code) ── */
            questions.length === 0 ? (
              <div style={emptyBoxStyle}>
                <div style={emptyIconStyle}>📝</div>
                <div style={emptyTitleStyle}>No questions yet</div>
                <p style={emptyTextStyle}>
                  Create questions and publish them so students can answer.
                </p>
              </div>
            ) : (
              questions.map((question, index) => (
                <QuestionCard
                  key={question.question_id}
                  question={question}
                  index={index + 1}
                  classId={class_id}
                />
              ))
              
            )
          ) : (
            /* ── STUDENT: Show action buttons or locked card ── */
            isLocked ? (
              <div style={examTimerStyles.lockedCard}>
                <div style={examTimerStyles.lockedIcon}>
                  {examStatus === "upcoming" ? "🔒" : "🏁"}
                </div>
                <div style={examTimerStyles.lockedTitle}>
                  {examStatus === "upcoming"
                    ? "Exam Not Started Yet"
                    : "Exam Has Ended"}
                </div>
                <div style={examTimerStyles.lockedSubtitle}>
                  {examStatus === "upcoming"
                    ? "Questions will appear here automatically once the exam begins."
                    : "You Can Check Your Results Here."}
                </div>
                  <button
                    style={resultsButtonStyle}
                    onClick={() => navigate(`/classes/${class_id}/results`)}
                  >
                    📊 View My Results
                  </button>
              </div>
            ) : (
              <div style={studentActionsStyle}>
                <button
                  style={examButtonStyle}
                  onClick={() => navigate(`/classes/${class_id}/exam`)}
                >
                  📝 Take Exam
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Admin: exam schedule modal ───────────────────────── */}
      {showScheduleModal && classData && (
        <ExamScheduleModal
          classId={class_id}
          currentSchedule={{
            exam_start_time: classData.exam_start_time,
            exam_duration_minutes: classData.exam_duration_minutes,
          }}
          onClose={() => setShowScheduleModal(false)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}