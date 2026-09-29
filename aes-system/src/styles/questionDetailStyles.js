const questionDetailStyles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f7fafc",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  container: {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "32px 24px 64px",
  },

  /* ─── Top Bar ─── */
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "12px",
  },

  backButton: {
    background: "none",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "14px",
    color: "#4a5568",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
  },

  actionButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  /* Admin buttons */
  editButton: {
    backgroundColor: "#edf2f7",
    color: "#2d3748",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    padding: "9px 18px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  publishButton: {
    backgroundColor: "#fff",
    color: "#3182ce",
    border: "1px solid #3182ce",
    borderRadius: "8px",
    padding: "9px 18px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  publishButtonDisabled: {
    backgroundColor: "#edf2f7",
    color: "#a0aec0",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "9px 18px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "not-allowed",
  },

  releaseButton: {
    backgroundColor: "#2b6cb0",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "9px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  releaseButtonDisabled: {
    backgroundColor: "#bee3f8",
    color: "#90cdf4",
    border: "none",
    borderRadius: "8px",
    padding: "9px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
  },

  /* Student button */
  answerButton: {
    backgroundColor: "#38a169",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "9px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  /* ─── Action Feedback ─── */
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

  /* ─── Question Card ─── */
  questionCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "28px 32px",
    marginBottom: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  questionCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  questionTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: 0,
  },

  publishedBadge: {
    backgroundColor: "#c6f6d5",
    color: "#276749",
    borderRadius: "20px",
    padding: "3px 12px",
    fontSize: "12px",
    fontWeight: "600",
  },

  draftBadge: {
    backgroundColor: "#fed7d7",
    color: "#c53030",
    borderRadius: "20px",
    padding: "3px 12px",
    fontSize: "12px",
    fontWeight: "600",
  },

  questionText: {
    fontSize: "17px",
    fontWeight: "500",
    color: "#1a202c",
    lineHeight: "1.7",
    margin: "0 0 20px",
  },

  divider: {
    borderTop: "1px solid #e2e8f0",
    margin: "20px 0",
  },

  keyAnswerTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: "0 0 10px",
  },

  keyAnswerText: {
    fontSize: "15px",
    color: "#2d3748",
    lineHeight: "1.7",
    margin: 0,
    backgroundColor: "#f7fafc",
    borderRadius: "8px",
    padding: "14px 16px",
    borderLeft: "3px solid #4299e1",
  },

  /* ─── Evaluation Status Section ─── */
  statusSection: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "28px 32px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a202c",
    margin: "0 0 20px",
  },

  /* ─── Empty / Pending States ─── */
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 16px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "40px",
    marginBottom: "12px",
  },

  emptyText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#4a5568",
    margin: "0 0 6px",
  },

  emptySubText: {
    fontSize: "14px",
    color: "#718096",
    margin: "0 0 20px",
  },

  pendingEvalState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    backgroundColor: "#fffaf0",
    border: "1px solid #fbd38d",
    borderRadius: "10px",
    padding: "18px 22px",
  },

  pendingText: {
    fontSize: "15px",
    color: "#744210",
    fontWeight: "500",
    margin: 0,
  },

  evaluateButton: {
    backgroundColor: "#38a169",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 22px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  evaluateButtonDisabled: {
    backgroundColor: "#c6f6d5",
    color: "#9ae6b4",
    border: "none",
    borderRadius: "8px",
    padding: "10px 22px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
  },

  /* ─── Summary Stats ─── */
  summarySection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "16px",
  },

  statCard: {
    backgroundColor: "#f7fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },

  statValue: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#2b6cb0",
  },

  statLabel: {
    fontSize: "12px",
    color: "#718096",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "center",
  },

  viewResultsButton: {
    alignSelf: "flex-end",
    backgroundColor: "#fff",
    color: "#3182ce",
    border: "1px solid #3182ce",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  /* ─── Loading / Error ─── */
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    fontSize: "16px",
    color: "#718096",
  },

  errorContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    fontSize: "16px",
    color: "#c53030",
  },

  viewResultsButton: {
  backgroundColor: "#ffffff",
  color: "#3182ce",
  border: "1px solid #3182ce",
  borderRadius: "6px",
  padding: "8px 16px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  marginRight: "12px",
},

// Add to the styles object in questionDetailStyles.js
editButton: {
  backgroundColor: "#edf2f7",
  color: "#2d3748",
  border: "1px solid #cbd5e0",
  borderRadius: "6px",
  padding: "8px 16px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  marginRight: "12px",
},
deleteButton: {
  backgroundColor: "#fff5f5",
  color: "#c53030",
  border: "1px solid #fc8181",
  borderRadius: "6px",
  padding: "8px 16px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  marginRight: "12px",
},
};

export default questionDetailStyles;