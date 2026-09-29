import { useState, useEffect, useRef } from "react";

function computeState(examStartTime, examDurationMinutes) {
  if (!examStartTime || !examDurationMinutes) {
    return {
      status: "none",
      startTime: null,
      endTime: null,
      secondsUntilStart: null,
      secondsRemaining: null,
    };
  }

  const now = new Date();
  const startTime = new Date(examStartTime);
  const endTime = new Date(
    startTime.getTime() + examDurationMinutes * 60 * 1000
  );

  if (now < startTime) {
    return {
      status: "upcoming",
      startTime,
      endTime,
      secondsUntilStart: Math.max(0, Math.floor((startTime - now) / 1000)),
      secondsRemaining: null,
    };
  }

  if (now < endTime) {
    return {
      status: "active",
      startTime,
      endTime,
      secondsUntilStart: 0,
      secondsRemaining: Math.max(0, Math.floor((endTime - now) / 1000)),
    };
  }

  return {
    status: "ended",
    startTime,
    endTime,
    secondsUntilStart: null,
    secondsRemaining: 0,
  };
}

export default function useExamTimer(
  examStartTime,
  examDurationMinutes,
  onStatusChange
) {
  const [timerState, setTimerState] = useState(() =>
    computeState(examStartTime, examDurationMinutes)
  );

  // Keep a ref to the latest callback so the interval doesn't capture stale closures
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  // Re-seed state whenever the schedule props change (e.g. admin updates schedule)
  useEffect(() => {
    setTimerState(computeState(examStartTime, examDurationMinutes));
  }, [examStartTime, examDurationMinutes]);

  // Tick every second while exam is upcoming or active
  useEffect(() => {
    if (timerState.status === "none" || timerState.status === "ended") return;

    const interval = setInterval(() => {
      setTimerState((prev) => {
        const next = computeState(examStartTime, examDurationMinutes);
        if (prev.status !== next.status && onStatusChangeRef.current) {
          onStatusChangeRef.current(prev.status, next.status);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examStartTime, examDurationMinutes, timerState.status]);

  return timerState;
}

// ── Helpers ─────────────────────────────────────────────────
export function formatCountdown(totalSeconds) {
  if (totalSeconds == null || totalSeconds < 0) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function formatDateTimeLocal(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  // Returns "YYYY-MM-DDTHH:mm" in local time (suitable for <input type="datetime-local">)
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}
