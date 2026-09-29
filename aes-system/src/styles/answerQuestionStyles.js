const answerQuestionStyles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f7fafc",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  container: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "32px 24px 64px",
  },

  backButton: {
    background: "none",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "14px",
    color: "#4a5568",
    cursor: "pointer",
    marginBottom: "28px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
  },

  /* ─── Question display ─── */
  questionCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "28px 32px",
    marginBottom: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  questionLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    margin: "0 0 10px",
  },

  questionText: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#1a202c",
    lineHeight: "1.7",
    margin: 0,
  },

  /* ─── Answer form ─── */
  formCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "28px 32px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  formLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2d3748",
    display: "block",
    marginBottom: "10px",
  },

  textarea: {
    width: "100%",
    minHeight: "180px",
    padding: "14px 16px",
    fontSize: "15px",
    color: "#2d3748",
    backgroundColor: "#f7fafc",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    resize: "vertical",
    outline: "none",
    lineHeight: "1.7",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },

  textareaFocus: {
    width: "100%",
    minHeight: "180px",
    padding: "14px 16px",
    fontSize: "15px",
    color: "#2d3748",
    backgroundColor: "#fff",
    border: "1px solid #4299e1",
    borderRadius: "8px",
    resize: "vertical",
    outline: "none",
    lineHeight: "1.7",
    fontFamily: "inherit",
    boxSizing: "border-box",
    boxShadow: "0 0 0 3px rgba(66,153,225,0.15)",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },

  charCount: {
    fontSize: "12px",
    color: "#a0aec0",
    textAlign: "right",
    marginTop: "6px",
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    marginTop: "20px",
  },

  submitButton: {
    backgroundColor: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "11px 28px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  submitButtonDisabled: {
    backgroundColor: "#bee3f8",
    color: "#90cdf4",
    border: "none",
    borderRadius: "8px",
    padding: "11px 28px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "not-allowed",
  },

  /* ─── Already answered banner ─── */
  answeredBanner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#f0fff4",
    border: "1px solid #c6f6d5",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#276749",
    fontWeight: "500",
  },

  /* ─── Feedback messages ─── */
  successMessage: {
    backgroundColor: "#f0fff4",
    color: "#276749",
    border: "1px solid #c6f6d5",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },

  errorMessage: {
    backgroundColor: "#fff5f5",
    color: "#c53030",
    border: "1px solid #fed7d7",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },

  /* ─── Loading ─── */
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh",
    fontSize: "16px",
    color: "#718096",
  },
};

export default answerQuestionStyles;