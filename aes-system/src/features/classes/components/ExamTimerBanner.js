import styles from "../../../styles/examTimerStyles";
import { formatCountdown } from "../hooks/useExamTimer";

function formatScheduleSummary(examStartTime, examDurationMinutes) {
  if (!examStartTime || !examDurationMinutes) return null;
  const start = new Date(examStartTime);
  const end = new Date(start.getTime() + examDurationMinutes * 60 * 1000);
  const opts = { dateStyle: "medium", timeStyle: "short" };
  return `${start.toLocaleString(undefined, opts)}  →  ${end.toLocaleString(
    undefined,
    opts
  )} (${examDurationMinutes} min)`;
}

export default function ExamTimerBanner({ role, timer, classData, onEditSchedule }) {
  const { status, secondsUntilStart, secondsRemaining } = timer;
  const scheduleSummary = formatScheduleSummary(
    classData.exam_start_time,
    classData.exam_duration_minutes
  );

  // ── Admin banner ─────────────────────────────────────────
  if (role === "admin") {
    const bannerStyle = scheduleSummary ? styles.adminBanner : styles.adminNoBanner;
    return (
      <div style={bannerStyle}>
        <div style={styles.bannerLeft}>
          <span style={styles.bannerIcon}>{scheduleSummary ? "📅" : "🕐"}</span>
          <div style={styles.bannerTextBlock}>
            <div style={styles.bannerTitle}>
              {scheduleSummary ? "Exam Scheduled" : "No Exam Scheduled"}
            </div>
            <div style={styles.bannerSubtitle}>
              {scheduleSummary ||
                "Set a start time and duration so questions unlock automatically."}
            </div>
          </div>
        </div>
        <button
          style={scheduleSummary ? styles.editScheduleButton : styles.setScheduleButton}
          onClick={onEditSchedule}
        >
          {scheduleSummary ? "✏️ Edit Schedule" : "+ Set Schedule"}
        </button>
      </div>
    );
  }

  // ── Student banners ──────────────────────────────────────
  if (status === "none") return null;

  if (status === "upcoming") {
    return (
      <div style={styles.upcomingBanner}>
        <div style={styles.bannerLeft}>
          <span style={styles.bannerIcon}>🔒</span>
          <div style={styles.bannerTextBlock}>
            <div style={styles.bannerTitle}>Exam Not Started</div>
            <div style={styles.bannerSubtitle}>
              Questions will appear automatically when the exam opens.
            </div>
          </div>
        </div>
        <div
          style={{ ...styles.countdown, ...styles.upcomingCountdown }}
          title="Time until exam starts"
        >
          {formatCountdown(secondsUntilStart)}
        </div>
      </div>
    );
  }

  if (status === "active") {
    const isLastFiveMinutes = secondsRemaining != null && secondsRemaining <= 300;
    return (
      <div style={styles.activeBanner}>
        <div style={styles.bannerLeft}>
          <span style={styles.bannerIcon}>✏️</span>
          <div style={styles.bannerTextBlock}>
            <div style={styles.bannerTitle}>Exam In Progress</div>
            <div style={styles.bannerSubtitle}>
              {isLastFiveMinutes
                ? "⚠️ Less than 5 minutes remaining!"
                : "Answer all questions before time runs out."}
            </div>
          </div>
        </div>
        <div
          style={{
            ...styles.countdown,
            ...styles.activeCountdown,
            color: isLastFiveMinutes ? "#dc2626" : "#15803d",
          }}
          title="Time remaining"
        >
          {formatCountdown(secondsRemaining)}
        </div>
      </div>
    );
  }

  if (status === "ended") {
    return (
      <div style={styles.endedBanner}>
        <div style={styles.bannerLeft}>
          <span style={styles.bannerIcon}>🔒</span>
          <div style={styles.bannerTextBlock}>
            <div style={styles.bannerTitle}>Exam Has Ended</div>
            <div style={styles.bannerSubtitle}>
              Please check your results page for feedback on your performance.
            </div>
          </div>
        </div>
        <div style={styles.endedText}>00:00:00</div>
      </div>
    );
  }

  return null;
}
