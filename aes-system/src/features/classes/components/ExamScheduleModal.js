// src/features/classes/components/ExamScheduleModal.js
//
// Modal for admin to set or clear the exam schedule for a class.
// The admin inputs local date/time — we convert to ISO (UTC) for the backend.

import { useState } from "react";
import { ACCESS_TOKEN_NAME } from "../../auth";
import styles from "../../../styles/examTimerStyles";
import { formatDateTimeLocal } from "../hooks/useExamTimer";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function ExamScheduleModal({ classId, currentSchedule, onClose, onSaved }) {
  // currentSchedule: { exam_start_time: ISO|null, exam_duration_minutes: number|null }

  const [startDateTimeLocal, setStartDateTimeLocal] = useState(
    currentSchedule?.exam_start_time
      ? formatDateTimeLocal(currentSchedule.exam_start_time)
      : ""
  );
  const [durationMinutes, setDurationMinutes] = useState(
    currentSchedule?.exam_duration_minutes
      ? String(currentSchedule.exam_duration_minutes)
      : ""
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success"|"error", text }

  const hasExistingSchedule =
    currentSchedule?.exam_start_time && currentSchedule?.exam_duration_minutes;

  async function patchSchedule(body) {
    const token = localStorage.getItem(ACCESS_TOKEN_NAME);
    const res = await fetch(
      `${API_BASE_URL}/classes/${classId}/exam-schedule`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save");
    return data;
  }

  async function handleSave() {
    if (!startDateTimeLocal) {
      setMessage({ type: "error", text: "Please select a start date and time." });
      return;
    }
    const mins = parseInt(durationMinutes, 10);
    if (!mins || mins < 1 || mins > 1440) {
      setMessage({ type: "error", text: "Duration must be between 1 and 1440 minutes." });
      return;
    }

    // Convert local datetime-local string to ISO UTC
    const isoStart = new Date(startDateTimeLocal).toISOString();

    setSaving(true);
    setMessage(null);
    try {
      await patchSchedule({ exam_start_time: isoStart, exam_duration_minutes: mins });
      setMessage({ type: "success", text: "Schedule saved!" });
      setTimeout(() => {
        onSaved();
        onClose();
      }, 800);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    if (!window.confirm("Remove the exam schedule for this class?")) return;
    setSaving(true);
    setMessage(null);
    try {
      await patchSchedule({ exam_start_time: null, exam_duration_minutes: null });
      onSaved();
      onClose();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalTitle}>⏱ Exam Schedule</div>
        <div style={styles.modalSubtitle}>
          Questions will unlock automatically at the start time and lock again
          when the duration expires.
        </div>

        {message && (
          <div style={message.type === "success" ? styles.successMsg : styles.errorMsg}>
            {message.text}
          </div>
        )}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Start Date &amp; Time (your local time)</label>
          <input
            type="datetime-local"
            style={styles.input}
            value={startDateTimeLocal}
            onChange={(e) => setStartDateTimeLocal(e.target.value)}
          />
          <div style={styles.inputHint}>
            Your timezone offset is UTC
            {new Date().getTimezoneOffset() <= 0
              ? `+${-new Date().getTimezoneOffset() / 60}`
              : `-${new Date().getTimezoneOffset() / 60}`}
            . The system stores this in UTC.
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Duration (minutes)</label>
          <input
            type="number"
            style={styles.input}
            value={durationMinutes}
            min={1}
            max={1440}
            placeholder="e.g. 60"
            onChange={(e) => setDurationMinutes(e.target.value)}
          />
          <div style={styles.inputHint}>
            {durationMinutes
              ? `Exam ends ${durationMinutes} minute(s) after start.`
              : "Enter a duration between 1 and 1440 minutes."}
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.cancelButton} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          {hasExistingSchedule && (
            <button style={styles.clearButton} onClick={handleClear} disabled={saving}>
              Clear Schedule
            </button>
          )}
          <button
            style={saving ? styles.saveButtonDisabled : styles.saveButton}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
